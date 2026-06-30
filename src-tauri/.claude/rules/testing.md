
# Testing (Vitest + NestJS)

## Test location: always `__tests__`

Put all spec files inside a `__tests__` folder next to the code they test. One spec per class/file.

```
auth/
  __tests__/
    auth.controller.spec.ts
    auth.service.spec.ts
  auth.controller.ts
  auth.service.ts
```

Do **not** place `*.spec.ts` next to the source file (e.g. no `auth.controller.spec.ts` beside `auth.controller.ts`). All tests live under `__tests__/`.

## File naming

- One spec per class: `auth.controller.spec.ts`, `auth.service.spec.ts`.
- Name matches the class under test.

## Structure

- **Top-level `describe`**: class name (e.g. `describe('AuthController', () => { ... })`).
- **Nested `describe`**: method name or logical group (e.g. `describe('login', () => { ... })`).
- **`it`**: one behavior per test; use a clear sentence ("should return 401 when password is wrong").

Use Vitest's `describe`, `it`, `beforeEach` from `vitest`. Use NestJS's `Test.createTestingModule()` to build the test module and `app.get(SomeClass)` to resolve the unit under test.

## NestJS test module

- Use `Test.createTestingModule({ controllers: [...], providers: [...] }).compile()` in `beforeEach`.
- Get the class under test with `app.get(SomeController)` or `app.get(SomeService)`.
- Mock dependencies: provide `{ provide: SomeService, useValue: { method: vi.fn() } }` (or a small stub object) so tests are fast and deterministic.

## Writing tests

- **Arrange–Act–Assert**: set up data and mocks, call the method, then assert outcomes.
- **One focus per `it`**: test one behavior; if you need to assert multiple things, they should support that single behavior.
- **Descriptive names**: "should return 401 when password is wrong" not "test login".
- Prefer testing public behavior (return values, thrown exceptions, calls to mocks). Avoid testing implementation details.

## Example (controller)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = { login: vi.fn() };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = app.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should return token when credentials are valid', async () => {
      authService.login.mockResolvedValue({ accessToken: 'jwt' });
      const result = await controller.login({
        email: 'a@b.com',
        password: 'secret',
      });
      expect(result).toEqual({ accessToken: 'jwt' });
    });
  });
});
```

## Imports in specs

- Import the class under test with a **relative path** from the spec to the source (e.g. `from '../auth.controller'` when the spec is in `auth/__tests__/auth.controller.spec.ts`).
