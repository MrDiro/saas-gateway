import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ExecutionContext, Module } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { AuthModule } from '@gateway/auth/auth.module';
import { ApiModule } from '@gateway/api/api.module';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard }
  ],
  imports: [
    ApiModule,
    AuthModule,
    RouterModule.register([
      {
        path: "api",
        module: ApiModule
      },
      {
        path: "auth",
        module: AuthModule
      }
    ]),
    ThrottlerModule.forRoot([
      {
        ttl: seconds(60),
        limit: 100,
        generateKey: (context: ExecutionContext) => {
          const http = context.switchToHttp();
          const request = http.getRequest();
          const ip = request.headers['x-forwarded-for']?.split(",")[0]?.trim();
          return ip || request?.ip || request.connection.remoteAddress;
        },
        skipIf: (context: ExecutionContext) => {
          const http = context.switchToHttp();
          const request = http.getRequest();
          const userAgent = request.headers['user-agent'] || '';
          return /googlebot|bingbot/gi.test(userAgent);
        }
      }
    ])
  ]
})
export class AppModule {}
