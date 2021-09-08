import { Scope } from '@guards';
import { SetMetadata } from '@nestjs/common';

export const SCOPES_KEY = 'scopes';
export const Scopes = (...scopes: Scope[]) => SetMetadata(SCOPES_KEY, scopes);
