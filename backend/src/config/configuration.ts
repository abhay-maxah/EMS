import { registerAs } from '@nestjs/config';

/**
 * Defines the application's configuration.
 * Uses `registerAs` to provide a namespace for configuration properties.
 *
 * Access configuration values via `ConfigService.get('app.port')` etc.
 */
export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10), // Default to 3000
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  // Add other configuration properties here, e.g.,
  // environment: process.env.NODE_ENV || 'development',
}));
