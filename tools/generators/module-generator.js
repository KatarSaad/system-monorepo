#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function toPascalCase(str) {
  return str.replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase());
}

function createModule(moduleName) {
  const moduleClass = toPascalCase(moduleName);
  const entityName = moduleName.replace('-management', '').replace('-service', '');
  const entityClass = toPascalCase(entityName);

  const modulePath = path.join(process.cwd(), 'src', 'modules', moduleName);

  // Create directory structure
  const dirs = [
    'domain/entities',
    'domain/value-objects', 
    'domain/events',
    'domain/repositories',
    'application/commands',
    'application/queries',
    'application/handlers',
    'infrastructure/repositories',
    'presentation/controllers',
    'presentation/dto'
  ];

  dirs.forEach(dir => {
    fs.mkdirSync(path.join(modulePath, dir), { recursive: true });
  });

  // Generate basic files
  generateEntityFile(modulePath, entityClass, entityName);
  generateModuleFile(modulePath, moduleClass, entityClass, entityName, moduleName);

  console.log(`✅ Module '${moduleName}' created successfully!`);
}

function generateEntityFile(modulePath, entityClass, entityName) {
  const content = `import { AggregateRoot } from '@system/core';

export class ${entityClass} extends AggregateRoot<string> {
  private constructor(
    id: string,
    private readonly _createdAt: Date
  ) {
    super(id);
  }

  static create(): ${entityClass} {
    return new ${entityClass}(
      crypto.randomUUID(),
      new Date()
    );
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}`;

  fs.writeFileSync(
    path.join(modulePath, 'domain', 'entities', `${entityName}.entity.ts`),
    content
  );
}

function generateModuleFile(modulePath, moduleClass, entityClass, entityName, moduleName) {
  const content = `import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: []
})
export class ${moduleClass}Module {}`;

  fs.writeFileSync(
    path.join(modulePath, `${moduleName}.module.ts`),
    content
  );
}

const moduleName = process.argv[2];
if (!moduleName) {
  console.error('❌ Please provide a module name');
  process.exit(1);
}

createModule(moduleName);