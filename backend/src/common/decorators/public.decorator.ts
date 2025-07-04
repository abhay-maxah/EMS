import { SetMetadata } from '@nestjs/common';

// Key used to store metadata indicating if a route is public
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
