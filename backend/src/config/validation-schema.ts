import * as Joi from 'joi';

/**
 * Joi schema for validating environment variables.
 * Ensures that all required environment variables are present and have the correct type.
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string()
    .required()
    .description('Database connection string is required'),
  JWT_SECRET: Joi.string()
    .required()
    .min(16)
    .description(
      'JWT secret key is required and should be at least 16 characters long',
    ),
  // Add other environment variables as needed
});
