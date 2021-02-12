try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    require('@dynatrace/oneagent')();
} catch (e) {
    console.warn(`OneAgent: ${e.message}`);
}

import { CommonConfigService, ConfigModule } from '@modules/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import basicAuth from 'express-basic-auth';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/exception.filter';
import { setupSwagger } from './swagger';

const API_PREFIX = '/api';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.select(ConfigModule).get(CommonConfigService);
    const logger = app.get(Logger);

    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
    if (configService.common.isProd) {
        app.use(
            basicAuth({
                authorizer: (user: string, password: string) => user === configService.auth.userName && password === configService.auth.password,
                challenge: true,
            }),
        );
    }
    if (configService.common.isDev || configService.common.isTest) {
        setupSwagger(app);
    }
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalFilters(new HttpExceptionFilter(logger));
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            dismissDefaultMessages: configService.common.isProd,
            validationError: {
                target: false,
            },
        }),
    );

    await app.listen(configService.common.port);

    logger.log(`Application is running on: ${await app.getUrl()}`);
}

(() => bootstrap())();
