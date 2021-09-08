import { SCOPES_KEY } from '@decorators';
import { AuthMethod, IGetUserAuthInfoRequest } from '@modules/auth/types';
import { CommonConfigService } from '@modules/config';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Scope } from './scope';

@Injectable()
export class ScopesGuard implements CanActivate {
    constructor(private reflector: Reflector, private configService: CommonConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        if (this.configService.auth.method !== AuthMethod.JWT) {
            return true;
        }

        const requiredScopes = this.reflector.getAllAndOverride<Scope[]>(SCOPES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredScopes) {
            return true;
        }

        const request = context.switchToHttp().getRequest() as IGetUserAuthInfoRequest;

        return requiredScopes.some((scope) => request.authInfo.checkLocalScope(scope));
    }
}
