import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { CommonConfigService, ConfigModule } from 'src/modules/config';

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
    ],
})
export class AppModule {

}
