
# DTO Design

## File locations

```
apps/<app>/src/<domain>/
  <domain>.controller.ts
  <domain>.service.ts
  dto/
    request/
      create-<domain>.dto.ts
      update-<domain>.dto.ts
    response/
      <domain>.dto.ts
```

- Use kebab-case filenames throughout.
- Request DTOs go in `dto/request/`, response DTOs go in `dto/response/`.

## DTO types

There are two kinds of DTOs with different rules:

| Type             | Purpose                | Validates?                       | Extends                                 |
| ---------------- | ---------------------- | -------------------------------- | --------------------------------------- |
| **Request DTO**  | Body/query/param input | Yes — `class-validator` required | Another request DTO when it makes sense |
| **Response DTO** | Shape of API response  | No — read-only, no validators    | The entity it represents                |

---

## Request DTOs

### Structure rules

- Every property must have **both** a `@ApiProperty` decorator and one or more `class-validator` decorators.
- Never use TypeScript types alone to validate — `class-validator` is always required.
- Always export the class as a named export.

### Extending request DTOs

When an update DTO is a superset of a create DTO (all fields become optional), extend using `PartialType` from `@nestjs/swagger`. This automatically makes all fields optional and preserves their `@ApiProperty` metadata.

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';

// All fields from CreateJobDto become optional — no need to re-declare them
export class UpdateJobDto extends PartialType(CreateJobDto) {}
```

When the update DTO only shares **some** fields with the create DTO, use `PickType` or `OmitType`:

```typescript
import { OmitType, PartialType } from '@nestjs/swagger';

// All fields except 'urlToScrape', all optional
export class UpdateJobDto extends PartialType(
  OmitType(CreateJobDto, ['urlToScrape'] as const),
) {}
```

Only extend another DTO when it genuinely reduces duplication. If the shapes differ significantly, define the update DTO from scratch.

## Decorator order

```typescript
@ApiProperty({ ... })   // 1st — Swagger
@IsString()             // 2nd — primary validator
@IsOptional()           // 3rd — optional modifier (if needed)
property: string;
```

## `@ApiProperty` rules

| Situation               | Required keys            |
| ----------------------- | ------------------------ |
| All properties          | `description`, `example` |
| Optional property       | + `required: false`      |
| Nullable property       | + `nullable: true`       |
| Enum property           | + `enum: <list>`         |
| Array property          | + `isArray: true`        |
| Property with a default | + `default: <value>`     |

## `class-validator` rules

- Match the validator to the exact TypeScript type — don't use `@IsString()` on a number.
- Always use `@IsOptional()` for optional properties, paired with `?` on the TypeScript type.
- Nullable properties (`T | null`) need both `@IsOptional()` and `@IsNullable()` (or `@ValidateIf(o => o.field !== null)`).
- Use `@Type()` from `class-transformer` for nested objects and arrays of objects.

## Examples

```typescript
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsUrl,
  IsEnum,
  IsArray,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// String
@ApiProperty({ description: 'The URL to scrape', example: 'https://example.com', maxLength: 2048 })
@IsUrl()
@MaxLength(2048)
urlToScrape: string;

// Integer with minimum
@ApiProperty({ description: 'Job priority', example: 1, default: 1 })
@IsInt()
@Min(1)
priority: number;

// Boolean
@ApiProperty({ description: 'Whether to ignore the sitemap', example: false, default: false })
@IsBoolean()
ignoreSitemap: boolean;

// Enum
@ApiProperty({ description: 'Wait until event', example: 'networkidle0', enum: waitUntilList })
@IsEnum(waitUntilList)
waitUntil: WaitUntil;

// Array of strings
@ApiProperty({ description: 'URLs to skip', example: ['https://example.com/skip'], isArray: true, default: [] })
@IsArray()
@IsString({ each: true })
blacklist: string[];

// Optional string
@ApiProperty({ description: 'Custom sitemap URL', example: 'https://example.com/sitemap.xml', required: false, nullable: true })
@IsOptional()
@IsUrl()
sitemapUrl?: string | null;

// Nested object
@ApiProperty({ description: 'Crawl options', type: () => CreateJobOptionsDto })
@Type(() => CreateJobOptionsDto)
@ValidateNested()
options: CreateJobOptionsDto;
```

## Complete request DTO example

```typescript
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsUrl,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    description: 'The URL to scrape',
    example: 'https://example.com',
    maxLength: 2048,
  })
  @IsUrl()
  @MaxLength(2048)
  urlToScrape: string;

  @ApiProperty({
    description: 'Job priority (higher = sooner)',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;
}
```

---

## Response DTOs

Response DTOs describe what the API returns. They must **not** contain `class-validator` decorators.

### Naming and file location

- Filename: `<name>.dto.ts` (no `response` in the filename)
- Class name: `<Domain>Dto` — e.g. `JobDto`, `JobOptionsDto` (no `Response` suffix)
- Lives in `dto/response/`

### Extend the entity

Response DTOs extend the entity they represent. Since the entity already has `@ApiProperty` on every column, the response DTO inherits the full Swagger schema for free.

```typescript
import { Job } from '@ve-webscraper/database';

export class JobDto extends Job {}
```

### Override or add properties when needed

Add `@ApiProperty` only for properties that differ from the entity (e.g. computed fields, renamed fields, or nested response DTOs).

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Job } from '@ve-webscraper/database';
import { JobOptionsDto } from './job-options.dto';

export class JobDto extends Job {
  @ApiProperty({
    description: 'Crawl options',
    type: () => JobOptionsDto,
    nullable: true,
  })
  declare options: JobOptionsDto;
}
```

### Use `@ApiExtraModels` at controller level for nested response types

If the response DTO has nested response DTOs, register them on the controller so Swagger picks them up:

```typescript
@ApiExtraModels(JobOptionsDto, JobCallbackConfigDto)
@Controller('jobs')
export class JobsController {}
```

### Returning DTOs from Services

Services must **never return raw entities**. They must always return response DTO instances. This is required so the global `ClassSerializerInterceptor` intercepts the DTO class and applies the `@Exclude()` rules correctly.

Use `plainToInstance` from `class-transformer` in the service to convert the entity to the DTO before returning it.

For simple DTOs that don't wrap an entity (like a generic `HttpSuccessDto`), just return a new instance directly `return new HttpSuccessDto('...')`.

```typescript
import { plainToInstance } from 'class-transformer';

@Injectable()
export class JobsService {
  async findOne(id: string): Promise<JobDto> {
    const entity = await this.jobRepository.findOneOrFail({ where: { id } });

    // Map entity to DTO so class-transformer decorators (@Exclude) run
    return plainToInstance(JobDto, entity);
  }

  async remove(id: string): Promise<HttpSuccessDto> {
    await this.jobRepository.remove(job);

    // Simply instantiate and return directly for non-entity DTOs
    return new HttpSuccessDto('Job deleted successfully');
  }
}
```

### Response DTO rules summary

- Filename: `dto/response/<name>.dto.ts`
- Class name: `<Domain>Dto` — no `Response` suffix
- Extends the entity class directly
- No `class-validator` decorators
- Override `@ApiProperty` only when the API shape differs from the entity
- Use `declare` when overriding an inherited property type
- Nested objects use their own response DTO type, not the entity type
- **Services must return DTO instances using `plainToInstance`**, never raw entities
