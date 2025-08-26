export abstract class BaseDto {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export abstract class CreateBaseDto {
  correlationId?: string;
}

export abstract class UpdateBaseDto {
  version?: number;
}
