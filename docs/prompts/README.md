# Prompt Rules & Templates

## Cautions

- Prefer simplicity over completeness. Only promise what exists.
- Mark non-implemented features as (placeholder).
- Keep imports via package barrels (e.g., `@system/core`).
- Avoid framework-specific decorators in shared libraries.

## Rules

- Names: use full, descriptive names (no 1–2 letter variables)
- Control flow: early returns, handle errors first
- Types: explicit signatures on exported APIs; no `any` in public APIs
- Comments: explain why (not how), no inline comment noise
- Formatting: match package style, avoid unrelated refactors
- Errors: return `Result<T>` from library code
- Events: publish domain events inside aggregates or services that own them

## Reusable Templates

### Service Method

```ts
import { BaseService, Result } from "@system/core";

export class ExampleService extends BaseService {
  async doWork(input: Input): Promise<Result<Output>> {
    return this.executeWithLogging(
      "doWork",
      async () => {
        // ... logic
        return okValue as Output;
      },
      { trace: true }
    );
  }
}
```

### Validation

```ts
import { ValidationService } from "@system/validation";
import Joi from "joi";

const schema = Joi.object({ email: Joi.string().email().required() });
const result = ValidationService.validate<{ email: string }>(data, schema);
```

### Event Handler (placeholder)

```ts
import { EventHandler } from "@system/events";

@EventHandler("UserCreated")
export class WelcomeEmailHandler {}
```

### Security Decorators (placeholder)

```ts
import { RateLimiter, RequirePermission } from "@system/security";

class Controller {
  @RateLimiter({ requests: 100, window: "1h" })
  @RequirePermission("users:create")
  async create() {}
}
```
