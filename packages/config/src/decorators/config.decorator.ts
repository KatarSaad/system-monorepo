import { Inject } from '@nestjs/common';

export const CONFIG_TOKEN = 'CONFIG_SERVICE';

export const InjectConfig = (key?: string) => {
  return Inject(key ? `CONFIG_${key.toUpperCase()}` : CONFIG_TOKEN);
};

export const ConfigProperty = (path: string) => {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata('config:path', path, target, propertyKey);
  };
};