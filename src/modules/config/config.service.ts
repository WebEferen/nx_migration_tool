import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

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

    public get git() {
        return {
            userName: this.configService.get<string>('GIT_USERNAME'),
            password: this.configService.get<string>('GIT_PASSWORD'),
            poolInterval: Number(this.configService.get<number>('GIT_POOL_INTERVAL')),
        };
    }

    public get auth() {
        return {
            userName: this.configService.get<string>('BASIC_AUTH_USER'),
            password: this.configService.get<string>('BASIC_AUTH_PASS'),
        };
    }
}
