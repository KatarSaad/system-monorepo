# Project Structure Guide

```
SYSTEM/
├─ packages/
│  ├─ core/                # Domain primitives, Result, utils
│  ├─ shared/              # File & number utilities (more to add)
│  ├─ infrastructure/      # Email adapter (others TBD)
│  ├─ validation/          # Joi-based ValidationService
│  ├─ events/              # Placeholders for event system
│  ├─ security/            # Placeholders for auth & decorators
│  ├─ monitoring/          # Logger, MetricsService
│  └─ testing/             # Minimal TestFactory & base
│
├─ services/               # Your application modules/services
│
├─ tools/
│  └─ generators/
│     └─ module-generator.js  # Creates DDD module folders
│
├─ templates/
│  └─ module-template/     # Reference template for modules
│
└─ docs/
   ├─ api/
   ├─ development/
   ├─ deployment/
   ├─ modules/
   ├─ prompts/             # Prompt rules & templates
   └─ structure/           # This guide
```

## Important Files

- `packages/core/src/index.ts` — Core barrel exports
- `packages/infrastructure/src/index.ts` — Infrastructure barrel
- `packages/validation/src/index.ts` — Validation barrel
- `tools/generators/module-generator.js` — Module scaffold
- `docs/PACKAGE_SETUP_PROMPTS.md` — Package setup and usage
- `docs/SYSTEM_TEMPLATE_PROMPT.md` — System template and examples

## Tips

- Keep packages framework-agnostic; add adapters in services layer
- Export only what exists; mark placeholders clearly
- Use `Result<T>` in library code to avoid exception flow
