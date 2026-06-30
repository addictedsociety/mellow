
# Code Style Guide

## Single responsibility

Each class and function does one thing. If you need "and" to describe what it does, split it.

- Classes: max ~200 lines. Extract helpers, sub-services, or value objects when growing.
- Methods: max ~20 lines. If a method needs scrolling, it should be broken up.

## Early returns

Avoid nested conditionals. Return or throw as soon as a condition is met.

```typescript
// ✅ GOOD
if (!job) throw new NotFoundException();
if (job.status === 'RUNNING') throw new ConflictException();
return this.process(job);

// ❌ BAD
if (job) {
  if (job.status !== 'RUNNING') {
    return this.process(job);
  }
}
```

## No enums — use `const` lists + derived types

```typescript
// ✅ GOOD
export const jobStatusList = [
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
] as const;
export type JobStatus = (typeof jobStatusList)[number];

// ❌ BAD
export enum JobStatus {
  PENDING,
  RUNNING,
  COMPLETED,
  FAILED,
}
```

`const` lists work at runtime (iterable, usable in TypeORM `enum:`, usable in `@IsEnum()`), and the derived type gives full type safety without the compiled enum overhead.

## Naming

- Variables and functions: `camelCase`, descriptive verbs for functions (`getJob`, `markAsRunning`)
- Classes: `PascalCase`
- Constants: `camelCase` for module-level, `SCREAMING_SNAKE_CASE` only for true global constants (env names, etc.)
- Booleans: prefix with `is`, `has`, `can`, `should` (`isLocked`, `hasCallback`)

## No magic values

Extract repeated literals to named constants.

```typescript
// ✅ GOOD
const MAX_LOCK_DURATION_MS = 5 * 60 * 1000;
if (elapsed > MAX_LOCK_DURATION_MS) { ... }

// ❌ BAD
if (elapsed > 300000) { ... }
```

## Avoid comments that explain what — only explain why

Code should be self-explanatory. Comments explain intent, trade-offs, or non-obvious constraints.

```typescript
// ✅ GOOD — explains why
// Postgres advisory lock used instead of a row lock to avoid deadlocks under high concurrency
await this.acquireAdvisoryLock(jobId);

// ❌ BAD — explains what (already obvious from the code)
// Get the job by id
const job = await this.jobRepository.findOne(id);
```

## Immutability preference

Prefer `const` over `let`. Avoid mutating function arguments.

## Small, focused imports

Import only what you use. Avoid barrel re-exports that pull in large dependency trees.
