import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
    
    public async saludo() {
        return "Hola, desde el servicio de auth";
    }
}