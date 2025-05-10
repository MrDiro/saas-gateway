import { AuthService } from "@gateway/auth/auth.service";
import { Controller, Get } from "@nestjs/common";

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get()
    public async index() {
        return this.authService.saludo();
    }
}