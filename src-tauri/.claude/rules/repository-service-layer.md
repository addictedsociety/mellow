
# Repository and service layer

## Inject repositories, not TypeORM `Repository<>`

Feature and application services (under `src/**`, including `src/organizations/**`, `src/mcp/**`, etc.) **must not** use `@InjectRepository(Entity)` with `Repository<T>`.

- **Do:** inject dedicated classes from `src/models/**/repositories/*.repository.ts` that extend `BaseRepository<T>` and are registered in [`src/models/repository.module.ts`](src/models/repository.module.ts).
- **Do:** import `RepositoryModule` in the Nest module that provides the service (instead of duplicating `TypeOrmModule.forFeature` for the same entities).

`@InjectRepository` stays **inside** `*.repository.ts` files only (constructor of the repository class).

## Aggregate existence checks

Pure persistence checks such as “organization with this id exists” belong on the aggregate repository, not scattered in services as private `assert*` methods.

- Example: `OrganizationRepository.ensureExistsById(id)` using `findOneOrFail` so missing rows surface as `EntityNotFoundError` → 404 via the global filter (see [error-handling.mdc](error-handling.mdc)).

## Returning data to HTTP layer

Services called by controllers should return response DTO instances (`plainToInstance` from `class-transformer` where entity mapping applies), per [dto-design.mdc](dto-design.mdc). Controllers then expose accurate Swagger `type` and TypeScript return types.
