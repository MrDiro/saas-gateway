import { NestExpressApplication } from '@nestjs/platform-express';
import * as rotatingFileStream from 'rotating-file-stream';
import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as morgan from 'morgan';
import helmet from 'helmet';

async function bootstrap() {
    const logger = new Logger();
    const isProd = process.env.NODE_ENV === 'production';
    const port = process.env.NODE_PORT!;

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        abortOnError: false,
        autoFlushLogs: true,
        bufferLogs: true,
        cors: {
            origin: "*",
            methods: [
                "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"
            ],
            allowedHeaders: [
                "Content-Type", "Authorization", "X-Requested-With"
            ],
            credentials: true,
        }
    });

    app.use(cookieParser());
    app.use(compression());
    app.use(helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        }
    }));

    app.disable("x-powered-by");
    app.enableCors();

    if (isProd) {
        const logFileName = () => `${(new Date()).toISOString().split("T")[0]}.log`;
        const logStream = rotatingFileStream.createStream(logFileName, {
            interval: "1d",
            compress: "gzip",
            size: "10M",
            path: "logs"
        });

        app.use(morgan("common", { stream: logStream }));
    }
    else {
        app.use(morgan("dev"));
    }

    await app.listen(port, () => {
        logger.log(`Is running on http://localhost:${port}/api 🚀`, "Api");
        logger.log(`Is running on http://localhost:${port}/api/document 🚀`, "Swagger");
    });
}

bootstrap();