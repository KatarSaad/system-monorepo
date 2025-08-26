import { SetMetadata } from '@nestjs/common';

export const SEARCHABLE_KEY = 'searchable';

export interface SearchableOptions {
  index: string;
  fields?: string[];
  boost?: Record<string, number>;
  analyzer?: string;
}

export const Searchable = (options: SearchableOptions) => 
  SetMetadata(SEARCHABLE_KEY, options);