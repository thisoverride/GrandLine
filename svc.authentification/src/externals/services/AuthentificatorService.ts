import jwt from 'jsonwebtoken';

export default class AuthentificatorService{

    public generateAuthToken(id: number){
        const secretKey = 'secret'; 
        const token = jwt.sign({ id }, secretKey, { expiresIn: '1h' });
        return token;
    }

}