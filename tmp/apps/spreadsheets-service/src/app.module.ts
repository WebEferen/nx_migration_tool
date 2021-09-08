import { AuthModule } from '@modules/auth';
import { CommonConfigService, ConfigModule } from '@modules/config';
import { SpreadsheetModule } from '@modules/spreadsheet';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ScopesGuard } from './guards/scopes.guard';

@Module({
    imports: [
        LoggerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [CommonConfigService],
            useFactory: async (config: CommonConfigService) => {
                return {
                    pinoHttp: {
                        level: config.common.isProd ? 'info' : 'debug',
                        prettyPrint: !config.common.isProd,
                    },
                };
            },
        }),
        SpreadsheetModule,
        ConfigModule,
        AuthModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ScopesGuard,
        },
    ],
})
export class AppModule {}
