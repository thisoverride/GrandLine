export interface VerificationCodeAttributes {
    id?: number;
    userId: number;
    email: string;
    code: string;
    expAt: Date;
}

