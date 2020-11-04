import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import basicAuth from 'express-basic-auth';
import { Logger } from 'nestjs-pino';
import { CommonConfigService, ConfigModule } from 'src/modules/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/exception.filter';

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

bootstrap();
