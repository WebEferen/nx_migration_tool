import { CommonConfigService, ConfigModule } from '@modules/config';
import { SpreadsheetModule } from '@modules/spreadsheet';
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

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
    ],
})
export class AppModule {}
