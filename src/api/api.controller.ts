import {  All, Controller, Req, Res } from "@nestjs/common";
import { ApiService } from "@gateway/api/api.service";
import { Request, Response } from "express";

@Controller()
export class ApiController {
    constructor(private readonly apiService: ApiService) {}

    @All(["", "/*path"])
    public async proxy(@Req() request: Request, @Res() response: Response) {
        this.apiService.proxy(request, response);
    }
}