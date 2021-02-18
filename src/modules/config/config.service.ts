import { AuthMethod, IServiceTypeXsuaa } from '@modules/auth/types';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { getServices } from '@sap/xsenv';
import { IXsuaaService } from '@sap/xssec';

const XSUAA_SERVICE_NAME = 'xsuaa-papm-broker';

@Injectable()
export class CommonConfigService {
    constructor(private configService: NestConfigService) {}

    public get common() {
        return {
            nodeEnv: this.configService.get<string>('NODE_ENV'),
            isDev: this.configService.get<string>('NODE_ENV') === 'dev',
            isTest: this.configService.get<string>('NODE_ENV') === 'test',
            isProd: this.configService.get<string>('NODE_ENV') === 'prod',
            port: this.configService.get<number>('APP_PORT'),
        };
    }
    public get auth() {
        const user = this.configService.get<string>('BASIC_AUTH_USER');
        const pass = this.configService.get<string>('BASIC_AUTH_PASS');

        return {
            user,
            pass,
            method: this.configService.get<string>('AUTH_METHOD') || this.tryGetDefaultAuthMethod(user, pass),
        };
    }

    public get sheet() {
        return {
            licenceKey: this.configService.get<string>('SPREADJS_LICENCE_KEY'),
        };
    }

    public get xsuaaService(): IXsuaaService {
        const { xsuaa } = getServices({ xsuaa: XSUAA_SERVICE_NAME }) as IServiceTypeXsuaa;
        return xsuaa;
    }

    private tryGetDefaultAuthMethod(user: string, pass: string) {
        try {
            this.xsuaaService;
            return AuthMethod.JWT;
        } catch {
            if (user && pass) {
                return AuthMethod.BASIC;
            }
            if (!this.common.isProd) {
                return AuthMethod.NONE;
            }
            throw new Error('Could not detect auth method');
        }
    }
}
