
# Entity & Repository Design

## File locations

- Entities: `libs/database/src/models/<domain>/entities/<name>.entity.ts`
- Repositories: `libs/database/src/models/<domain>/repositories/<name>.repository.ts`
- Use kebab-case filenames.

## Entities

Every entity **must** extend `BaseEntity` from `../../base/entities/base.entity` (not TypeORM's own `BaseEntity`). This provides `id` (UUID), `createdAt`, and `updatedAt` automatically.

```typescript
// ✅ GOOD
import { BaseEntity } from '../../base/entities/base.entity';

@Entity('jobs')
export class Job extends BaseEntity { ... }

// ❌ BAD — TypeORM's BaseEntity has no primary column
import { BaseEntity } from 'typeorm';
export class Job extends BaseEntity { ... }
```

## Column types — always be explicit

Always specify `type` in `@Column()`. TypeORM cannot infer the type from union types like `string | null` and will throw at runtime.

```typescript
// ✅ GOOD
@Column({ type: 'varchar', length: 255, nullable: true })
lockedBy: string | null;

@Column({ type: 'timestamptz', nullable: true })
lockedAt: Date | null;

@Column({ type: 'boolean', default: false })
ignoreSitemap: boolean;

@Column({ type: 'text', array: true, default: [] })
blacklist: string[];

// ❌ BAD — type inferred as "Object" for union types
@Column({ nullable: true })
lockedBy: string | null;
```

## Enums

Define enums as a `const` array + derived type in the same file. Pass the array to `enum:` in `@Column`.

```typescript
export const jobStatusList = ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'] as const;
export type JobStatus = (typeof jobStatusList)[number];

@Column({ type: 'enum', enum: jobStatusList, default: 'PENDING' })
status: JobStatus;
```

## Relations

- The **owning** side (the one with the FK) carries `@JoinColumn()`.
- The parent entity uses `cascade: true`; the child uses `onDelete: 'CASCADE'`.

```typescript
// Parent (no JoinColumn, has cascade)
@OneToOne(() => JobOptions, (o) => o.job, { cascade: true })
options: JobOptions;

// Child (has JoinColumn, has onDelete)
@OneToOne(() => Job, (j) => j.options, { onDelete: 'CASCADE' })
@JoinColumn()
job: Job;
```

## Swagger (`@ApiProperty`)

Every `@Column` field **and** every relation field must have a `@ApiProperty` decorator placed directly above it. No property should be undocumented.

### Required fields on `@ApiProperty`

| Situation             | Required keys                             |
| --------------------- | ----------------------------------------- |
| All columns           | `description`, `example`                  |
| Nullable column       | + `nullable: true`                        |
| Enum column           | + `enum: <list>`                          |
| Array column          | + `isArray: true`                         |
| Column with a default | + `default: <value>`                      |
| Relation              | `description`, `type: () => RelatedClass` |

### Examples

```typescript
// Plain string
@ApiProperty({ description: 'The URL to scrape', example: 'https://example.com', maxLength: 2048 })
@Column({ type: 'varchar', length: 2048 })
urlToScrape: string;

// Nullable string
@ApiProperty({ description: 'Worker that locked this job', example: 'worker-123', nullable: true })
@Column({ type: 'varchar', length: 255, nullable: true })
lockedBy: string | null;

// Nullable date
@ApiProperty({ description: 'When the job was locked', example: '2024-01-01T00:00:00.000Z', nullable: true })
@Column({ type: 'timestamptz', nullable: true })
lockedAt: Date | null;

// Boolean with default
@ApiProperty({ description: 'Whether to ignore the sitemap', example: false, default: false })
@Column({ type: 'boolean', default: false })
ignoreSitemap: boolean;

// Enum
@ApiProperty({ description: 'Current status of the job', example: 'PENDING', enum: jobStatusList })
@Column({ type: 'enum', enum: jobStatusList, default: 'PENDING' })
status: JobStatus;

// Array
@ApiProperty({ description: 'URLs to skip during crawl', example: ['https://example.com/ignore'], isArray: true, default: [] })
@Column({ type: 'text', array: true, default: [] })
blacklist: string[];

// Relation — eager: true on parent side → include @ApiProperty
@ApiProperty({ description: 'Crawl options for this job', type: () => JobOptions })
@OneToOne(() => JobOptions, (o) => o.job, { cascade: true, eager: true })
options: JobOptions;

// Relation — NOT eager, or child side → no @ApiProperty
@OneToOne(() => Job, (j) => j.options, { onDelete: 'CASCADE' })
@JoinColumn()
job: Job;
```

### Relation `@ApiProperty` rules

- **Only** add `@ApiProperty` to a relation when `eager: true` is set, because only then is the related object included in API responses.
- **Never** add `@ApiProperty` to the child (owning) side — the child side carries `@JoinColumn()` and is not exposed in responses.

### `@ApiProperty` decorator order

Always place `@ApiProperty` **first** (outermost), then the TypeORM decorator:

```typescript
// ✅ GOOD
@ApiProperty({ ... })
@Column({ ... })
field: string;

// ❌ BAD
@Column({ ... })
@ApiProperty({ ... })
field: string;
```

## Repositories

Every repository extends `BaseRepository<Entity>` and is decorated with `@Injectable()`. The constructor injects the TypeORM `Repository<Entity>` via `@InjectRepository`.

```typescript
@Injectable()
export class JobRepository extends BaseRepository<Job> {
  constructor(
    @InjectRepository(Job)
    readonly repository: Repository<Job>,
  ) {
    super(repository);
  }
}
```

Repositories are **auto-discovered** at startup via `RepositoryModule`. No manual registration is needed — just place the file in the correct location with the `.repository.ts` suffix and the `@Injectable()` decorator.
