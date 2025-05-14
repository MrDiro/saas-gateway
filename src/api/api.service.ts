import { HttpStatus, Injectable } from "@nestjs/common";
import { AxiosError, AxiosResponse } from "axios";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { Request, Response } from "express";

@Injectable()
export class ApiService {
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {}

    public getRequest(req: Request, res: Response) {
        const request = this.httpService.get(req.originalUrl.substring(4), {
            baseURL: this.configService.get<string>("BASE_URL"),
            params: req.params,
            responseType: "arraybuffer",
            headers: {
                "Accept": req.headers["accept"],
                "User-Agent": req.headers["user-agent"],
            }
        });

        request.subscribe({
            next: (response) => {
                this.handleResponse(response, res);
            }, 
            error: (err) => {
                this.handleErros(err, res);
            }
        });
    }

    public postRequest(req: Request, res: Response) {
        const request = this.httpService.post(req.originalUrl.substring(4), req.body, {
            baseURL: this.configService.get<string>("BASE_URL"),
            params: req.params,
            responseType: "arraybuffer",
            headers: {
                "Accept": req.headers["accept"],
                "User-Agent": req.headers["user-agent"],
                "Content-Type": req.headers["content-type"],
                "Content-Encoding": req.headers["content-encoding"]
            }
        });

        request.subscribe({
            next: (response) => {
                this.handleResponse(response, res);
            },
            error: (err) => {
                this.handleErros(err, res);
            }
        });
    }

    private handleResponse(axiosResponse: AxiosResponse, res: Response) {
        const buffer = Buffer.from(axiosResponse.data);
        const content_type = axiosResponse.headers["content-type"] || "application/octet-stream";
        const content_length = buffer.length.toString();

        res.setHeader("content-type", content_type);
        res.setHeader("content-length", content_length);
        res.status(axiosResponse.status).send(buffer);
    }

    private handleErros(error:any, res: Response) {
        console.error(error);
        
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