import { ConfigModule } from '@modules/config';
import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
