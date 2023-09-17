import {VerificationCodeAttributes} from "./test"

export class VerificationCodeDto {
    public id: undefined | number;
    public userId: number;
    public email: string;
    public code: string;


    public constructor(verificationCodeAttributes: VerificationCodeAttributes) {
        this.id = verificationCodeAttributes.id ?? undefined
        this.userId = verificationCodeAttributes.userId;
        this.email = verificationCodeAttributes.email;
        this.code = verificationCodeAttributes.code;

    }
}
