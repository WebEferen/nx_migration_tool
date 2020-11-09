import Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { existsSync } from 'fs-extra';
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
                BASIC_AUTH_USER: Joi.string().when('NODE_ENV', {
                    is: Joi.equal('prod'),
                    then: Joi.required(),
                    otherwise: Joi.optional(),
                }),
                BASIC_AUTH_PASS: Joi.string().when('NODE_ENV', {
                    is: Joi.equal('prod'),
                    then: Joi.required(),
                    otherwise: Joi.optional(),
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
