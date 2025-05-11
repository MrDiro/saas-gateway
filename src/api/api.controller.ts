import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { ApiService } from "@gateway/api/api.service";
import { Request, Response } from "express";

@Controller()
export class ApiController {
    constructor(private readonly apiService: ApiService) {}

    @Get("/*path")
    public getRequest(@Req() request: Request, @Res() response: Response) {
        this.apiService.getRequest(request, response);
    }

    @Post("/*path")
    public postRequest(@Req() request: Request, @Res() response: Response) {
        this.apiService.postRequest(request, response);
    }
}