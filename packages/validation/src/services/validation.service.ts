import { Result } from "@katarsaad/core";
import * as Joi from "joi";

export class ValidationService {
  static validate<T>(data: unknown, schema: Joi.Schema): Result<T> {
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
      const errors = error.details.map(
        (detail: Joi.ValidationErrorItem) => detail.message
      );
      return Result.fail(`Validation failed: ${errors.join(", ")}`);
    }

    return Result.ok(value as T);
  }

  static async validateAsync<T>(
    data: unknown,
    schema: Joi.Schema
  ): Promise<Result<T>> {
    try {
      const value = await schema.validateAsync(data, { abortEarly: false });
      return Result.ok(value as T);
    } catch (error: unknown) {
      const joiError = error as Joi.ValidationError;
      const errors = joiError?.details?.map(
        (detail: Joi.ValidationErrorItem) => detail.message
      ) || [joiError?.message || "Validation failed"];
      return Result.fail(`Validation failed: ${errors.join(", ")}`);
    }
  }
}
