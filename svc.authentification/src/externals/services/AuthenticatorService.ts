import jwt from 'jsonwebtoken';

export default class AuthenticatorService{

    public generateAuthToken(id: number){
        const secretKey = process.env.SECRET_KEY as string; 
        console.log(secretKey)
        const token = jwt.sign({ id }, secretKey, { expiresIn: '1h' });
        return token;
    }

}