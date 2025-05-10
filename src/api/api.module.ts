import { ApiController } from "@gateway/api/api.controller";
import { ApiService } from "@gateway/api/api.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

@Module({
    imports: [ 
        HttpModule,
        ConfigModule
    ],
    controllers: [ ApiController ],
    providers: [ ApiService ]
})
export class ApiModule {}