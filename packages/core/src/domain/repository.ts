export interface Repository<T, ID> {
  save(entity: T): Promise<void>;
  findById(id: ID): Promise<T | null>;
  delete(id: ID): Promise<void>;
}

export interface ReadOnlyRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
}

export interface WriteOnlyRepository<T, ID> {
  save(entity: T): Promise<void>;
  delete(id: ID): Promise<void>;
}