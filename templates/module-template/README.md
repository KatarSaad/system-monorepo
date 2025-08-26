# Module Template

This template provides a complete DDD module structure with all necessary components.

## Usage

```bash
npm run create:module <module-name>
```

## Generated Structure

```
<module-name>/
├── domain/
│   ├── entities/
│   │   └── <entity>.entity.ts
│   ├── value-objects/
│   │   └── <value-object>.ts
│   ├── events/
│   │   └── <event>.event.ts
│   ├── repositories/
│   │   └── <entity>.repository.ts
│   └── services/
│       └── <domain-service>.service.ts
├── application/
│   ├── commands/
│   │   ├── create-<entity>.command.ts
│   │   └── update-<entity>.command.ts
│   ├── queries/
│   │   ├── get-<entity>.query.ts
│   │   └── get-<entities>.query.ts
│   ├── handlers/
│   │   ├── create-<entity>.handler.ts
│   │   ├── update-<entity>.handler.ts
│   │   ├── get-<entity>.handler.ts
│   │   └── get-<entities>.handler.ts
│   ├── services/
│   │   └── <entity>.service.ts
│   └── dto/
│       └── <entity>.dto.ts
├── infrastructure/
│   ├── repositories/
│   │   └── prisma-<entity>.repository.ts
│   ├── adapters/
│   ├── persistence/
│   │   └── <entity>.model.ts
│   └── config/
│       └── <module>.config.ts
├── presentation/
│   ├── controllers/
│   │   └── <entity>.controller.ts
│   ├── dto/
│   │   ├── create-<entity>.dto.ts
│   │   ├── update-<entity>.dto.ts
│   │   └── <entity>-response.dto.ts
│   ├── guards/
│   └── decorators/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── <module-name>.module.ts
```

## Template Variables

- `{{MODULE_NAME}}` - Module name (kebab-case)
- `{{MODULE_CLASS}}` - Module class name (PascalCase)
- `{{ENTITY_NAME}}` - Entity name (kebab-case)
- `{{ENTITY_CLASS}}` - Entity class name (PascalCase)
- `{{ENTITY_LOWER}}` - Entity name (lowercase)

## Customization

Edit the template files in this directory to customize the generated code structure.