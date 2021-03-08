import { AuthMethod } from '@modules/auth/types';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { existsSync } from 'fs-extra';
import Joi from 'joi';
import { CommonConfigService } from './config.service';

@Module({
    imports: [
        NestConfigModule.forRoot({
            envFilePath: (() => {
                const configPath = `config/${process.env.NODE_ENV || 'dev'}.env`;

                if (!existsSync(configPath)) {
                    return null;
                }

                return configPath;
            })(),
            validationSchema: Joi.object({
                // Common variables
                NODE_ENV: Joi.string().valid('dev', 'prod', 'test').default('dev'),
                APP_PORT: Joi.number().default(5002),

                // Authentication
                AUTH_METHOD: Joi.string()
                    .valid(...Object.values(AuthMethod))
                    .empty(''),
                BASIC_AUTH_USER: Joi.string().when('AUTH_METHOD', {
                    is: AuthMethod.BASIC,
                    then: Joi.required(),
                    otherwise: Joi.optional().empty(''),
                }),
                BASIC_AUTH_PASS: Joi.string().when('AUTH_METHOD', {
                    is: AuthMethod.BASIC,
                    then: Joi.required(),
                    otherwise: Joi.optional().empty(''),
                }),

                // SpreadJS
                SPREADJS_LICENCE_KEY: Joi.string().required(),
            }),
        }),
    ],
    providers: [CommonConfigService],
    exports: [CommonConfigService],
})
export class ConfigModule {}
