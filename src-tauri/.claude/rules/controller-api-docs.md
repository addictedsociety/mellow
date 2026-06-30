
# Controller API Documentation

## Class-level decorators

Every controller must have `@ApiTags` with the domain name (singular, lowercase).

Auth (`@ApiBearerAuth` etc.) is configured globally in `main.ts` — never add it to individual controllers or methods.

Responses that can occur on **every** endpoint (e.g. 401, 403) are declared once at class level:

```typescript
@ApiTags('jobs')
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
@ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
@Controller('jobs')
export class JobsController {}
```

---

## Method-level decorators — required on every endpoint

Every route method must have:

1. `@ApiOperation` — without a summary (description only, if needed at all)
2. One `@ApiResponse` per possible HTTP status code — always using `HttpStatus` enum

```typescript
@ApiOperation({})
@ApiResponse({ status: HttpStatus.CREATED, type: JobResponseDto, description: 'Job created successfully' })
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request body' })
@Post()
create(@Body() dto: CreateJobDto): Promise<JobResponseDto> {}
```

---

## `@ApiResponse` usage

Always use `@ApiResponse` with the `status` field set to a `HttpStatus` enum value. Never use the shorthand decorators (`@ApiOkResponse`, `@ApiCreatedResponse`, etc.).

Always pass `type` for success responses. Always pass `description` for all responses.

Never use `type: Object`, `type: [Object]`, or other untyped placeholders for success responses — use the concrete response DTO class (and `isArray: true` for lists). Controller handler return types must be explicit (`Promise<MyResponseDto>` / `Promise<MyResponseDto[]>`), not inferred from untyped service returns.

```typescript
// ✅ GOOD
@ApiResponse({ status: HttpStatus.OK, type: JobResponseDto, description: 'The job' })
@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })

// ❌ BAD — shorthand decorators
@ApiOkResponse({ type: JobResponseDto })
@ApiNotFoundResponse({ description: 'Job not found' })

// ❌ BAD — raw number instead of enum
@ApiResponse({ status: 200, type: JobResponseDto })
```

For array responses add `isArray: true`:

```typescript
@ApiResponse({ status: HttpStatus.OK, type: JobResponseDto, isArray: true, description: 'List of jobs' })
```

---

## Parameters

### Route params (`@Param`)

`@Param` is picked up by Swagger automatically — do not add `@ApiParam` unless you need to document a description or example beyond what Swagger infers.

### Query params (`@Query`)

```typescript
@ApiQuery({ name: 'status', enum: jobStatusList, required: false, description: 'Filter by status' })
@Get()
findAll(@Query('status') status?: JobStatus) {}
```

### Request body

The body type is inferred from the DTO class — no `@ApiBody` needed when using a typed DTO.

---

## `@ApiExtraModels` for nested response types

Register nested response DTO types on the controller so Swagger resolves them:

```typescript
@ApiExtraModels(JobOptionsDto, JobCallbackConfigDto)
@ApiTags('jobs')
@Controller('jobs')
export class JobsController {}
```

---

## Complete endpoint example

```typescript
import { HttpStatus } from '@nestjs/common';

@ApiExtraModels(JobOptionsDto)
@ApiTags('jobs')
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
@ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
@Controller('jobs')
export class JobsController {
  @ApiOperation({})
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: JobDto,
    description: 'Job created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body',
  })
  @Post()
  create(@Body() dto: CreateJobDto): Promise<JobDto> {}

  @ApiOperation({})
  @ApiResponse({
    status: HttpStatus.OK,
    type: JobDto,
    isArray: true,
    description: 'List of all jobs',
  })
  @Get()
  findAll(): Promise<JobDto[]> {}

  @ApiOperation({})
  @ApiResponse({ status: HttpStatus.OK, type: JobDto, description: 'The job' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<JobDto> {}

  @ApiOperation({})
  @ApiResponse({
    status: HttpStatus.OK,
    type: JobDto,
    description: 'Updated job',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateJobDto): Promise<JobDto> {}

  @ApiOperation({})
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Job deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {}
}
```
