import { APIRequestContext, APIResponse } from '@playwright/test'; 

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    expiresIn: number;
    tokenType: string;
    user: {
        id: string;
        email: string;
    };
}

export class AuthService {
    private readonly LOGIN_ENDPOINT = '/api/v1/auth/login';
    constructor(private request: APIRequestContext) {}

    async login(credentials: LoginRequest): Promise<APIResponse> {
    const response = await this.request.post(this.LOGIN_ENDPOINT, {
        data: credentials,
    });

    if (!response.ok()) {
        throw new Error(`Failed to get token: ${response.status()} - ${response.statusText()}`);
    }
    return await response.json();
    }
}
