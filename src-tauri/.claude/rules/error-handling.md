
# Error Handling

## Use `findOneOrFail` — never check for null manually

The global exception filter (`HttpExceptionFilter`) already handles TypeORM's `EntityNotFoundError` and maps it to a `404 Not Found` response. Use `findOneOrFail` instead of `findOne` + null check.

```typescript
// ✅ GOOD — EntityNotFoundError is caught globally → 404
async findOne(id: string): Promise<Job> {
  return this.jobRepository.findOneOrFail({
    where: { id },
    relations: { options: true },
  });
}

// ❌ BAD — manual null check is unnecessary boilerplate
async findOne(id: string): Promise<Job> {
  const job = await this.jobRepository.findOne({ where: { id } });
  if (!job) throw new NotFoundException(`Job ${id} not found`);
  return job;
}
```

## Throw NestJS HTTP exceptions for business logic errors

For errors that are not "entity not found" (e.g. a conflict, a forbidden action), throw the appropriate NestJS exception directly in the service. The global filter handles all `HttpException` subclasses.

```typescript
import { ConflictException, ForbiddenException } from '@nestjs/common';

if (job.status === 'RUNNING')
  throw new ConflictException('Job is already running');
if (job.lockedBy !== workerId)
  throw new ForbiddenException('Job is locked by another worker');
```

## Never swallow errors

Do not catch errors unless you intend to recover or re-throw with additional context.

```typescript
// ❌ BAD
try {
  await this.jobRepository.save(job);
} catch (e) {}

// ✅ GOOD — let it bubble to the global filter
await this.jobRepository.save(job);
```
