import { InternalServerErrorException } from '@exceptions';
import { CommonConfigService } from '@modules/config';
import { Injectable } from '@nestjs/common';
import { JWTStrategy } from '@sap/xssec';
import { NextFunction, Request, Response } from 'express';
import expressBasicAuth from 'express-basic-auth';
import passport, { Strategy } from 'passport';
import { AuthMethod } from './types';

@Injectable()
export class AuthService {
    constructor(private readonly configService: CommonConfigService) {}

    public getMiddlewares() {
        switch (this.configService.auth.method) {
            case AuthMethod.JWT:
                return this.getJwtMiddleware();
            case AuthMethod.BASIC:
                return this.getBasicMiddleware();
            case AuthMethod.NONE:
                return (_req: Request, _res: Response, next: NextFunction) => next();
            default:
                throw new InternalServerErrorException('Invalid authentication method');
        }
    }

    private getBasicMiddleware() {
        return expressBasicAuth({
            authorizer: (user: string, password: string) => user === this.configService.auth.user && password === this.configService.auth.pass,
            challenge: true,
        });
    }

    private getJwtMiddleware() {
        try {
            passport.use((new JWTStrategy(this.configService.xsuaaService) as unknown) as Strategy);

            return [passport.initialize({ userProperty: '' }), passport.authenticate('JWT', { session: false })];
        } catch {
            throw new InternalServerErrorException('Wrong environment configuration for JWT authentication method');
        }
    }
}
