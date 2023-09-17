import VerificationCode from '../../framework/sequelize/repositories/VerificationCode.model'
import { VerificationCodeDto } from '../dto/VerificationCodeDto';
import { RepositoryImpl } from './  RepositoryImpl';

/**
 * Repository for managing users.
 */
export default class VerificationCodeRepository implements RepositoryImpl {

    public async findById(id: string): Promise<VerificationCode | null> {
        try {
            return await VerificationCode.findByPk(id);
        } catch (error) {
            throw Error(`${error}`)
        }

    }
    public async create(verificationCodeDto: VerificationCodeDto): Promise<VerificationCode> {
        try {
            console.log(verificationCodeDto.id)
            if (verificationCodeDto.userId != undefined) {
                const createdCode = await VerificationCode.create({
                    userId: verificationCodeDto.userId,
                    email: verificationCodeDto.email,
                    code: verificationCodeDto.code
                });
                return createdCode; // Renvoie l'objet créé
            } else {
                throw new Error('L\'ID est requis pour créer un code de vérification.');
            }
        } catch (error) {
            throw new Error(`Erreur lors de la création du code de vérification : ${error}`);
        }
    }
    public async findByCode(grandLineId: string, code: string) {
        try {
            const createdCode = await VerificationCode.findOne({
                where: {
                    email: grandLineId,
                    code: code
                }
            });
            return createdCode;

        } catch (error) {
            console.error("Error finding verification code:", error);
        }
    }
    public async findByUserId(id: string): Promise<any> {
        try {
            return await VerificationCode.findOne({ where: { userId: id } });
        } catch (error) {
            throw new Error(`Error while searching for user by ID: ${error}`);
        }
    }
    public async findByGrandLineId(grandLineId: string): Promise<any> {
        throw new Error(`Method not implemented ${grandLineId}.`);
    }

}
