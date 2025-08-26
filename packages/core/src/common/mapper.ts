export abstract class Mapper<Domain, Persistence, Dto> {
  abstract toDomain(raw: Persistence): Domain;
  abstract toPersistence(domain: Domain): Persistence;
  abstract toDto(domain: Domain): Dto;

  toDomainBulk(raws: Persistence[]): Domain[] {
    return raws.map(raw => this.toDomain(raw));
  }

  toPersistenceBulk(domains: Domain[]): Persistence[] {
    return domains.map(domain => this.toPersistence(domain));
  }

  toDtoBulk(domains: Domain[]): Dto[] {
    return domains.map(domain => this.toDto(domain));
  }
}