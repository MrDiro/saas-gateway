import { HttpStatus, Injectable } from "@nestjs/common";
import { AxiosError, AxiosRequestConfig } from "axios";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { Request, Response } from "express";
import { lastValueFrom } from "rxjs";

@Injectable()
export class ApiService {
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {}

    public async proxy(req: Request, res: Response) {
        try {
            const url = req.originalUrl.substring(4);

            const config: AxiosRequestConfig = {
                baseURL: this.configService.get<string>("BASE_URL"),
                url: url,
                method: req.method,
                data: req.body,
                params: req.query,
                headers: this.sanitizeHeaders(req.headers),
                responseType: 'arraybuffer'
            };

            const response = await lastValueFrom(this.httpService.request(config));
            const buffer = Buffer.from(response.data);
            
            const content_type = response.headers["content-type"] || "application/octet-stream";
            const content_length = buffer.length.toString();

            res.setHeader("content-type", content_type);
            res.setHeader("content-length", content_length);
            res.status(response.status).send(buffer);
        }
        catch (error) {
            this.handleErros(error, res);
        }
    }

    private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
        const { ...safeHeaders } = headers;
        return safeHeaders;
    }

    private handleErros(error:any, res: Response) {        
        if (error instanceof AxiosError) {
            const response = error.response;

            if (response) {
                const content_type = response.headers["content-type"] || "text/plain";
                const content_length = response.headers["content-length"];

                content_type && res.setHeader("content-type", content_type);
                content_length && res.setHeader("content-length", content_length);

                res.status(response.status).send(response.data);
            }
            else {
                const isConnectionRefused = error.code === "ECONNREFUSED";
                const status = isConnectionRefused ? HttpStatus.SERVICE_UNAVAILABLE : (error.status || 500);
                const message = isConnectionRefused ? "No se pudo conectar con la API" : "Error inesperado del proxy";

                res.status(status).send({ error: message });
            }
        }
        else {
            res.status(500).send({ error: error?.message || "Error desconocido" })
        }
    }
}