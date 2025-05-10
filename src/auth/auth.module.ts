import { AuthController } from "@gateway/auth/auth.controller";
import { AuthService } from "@gateway/auth/auth.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        HttpModule,
        ConfigModule
    ],
    controllers: [ AuthController ],
    providers: [ AuthService ]
})
export class AuthModule {}