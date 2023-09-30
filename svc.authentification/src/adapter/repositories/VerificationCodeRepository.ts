import { Op } from 'sequelize';
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
    
    public async update(strCode: string, id: number,expirationDate: Date ) {
        try {
            return await VerificationCode.update({ code: strCode, expAt : expirationDate }, { where: { userId: id } })
        } catch (error) {
            throw Error(`${error}`)
        }

    }
    public async create(verificationCodeDto: VerificationCodeDto): Promise<VerificationCode> {
        try {
            if (verificationCodeDto.userId != undefined) {
                const createdCode = await VerificationCode.create({
                    userId: verificationCodeDto.userId,
                    email: verificationCodeDto.email,
                    code: verificationCodeDto.code,
                    expAt: verificationCodeDto.expAt
                });
                return createdCode;
            } else {
                throw new Error('Invalid id provided verification code is no\'t createad');
            }
        } catch (error) {
            throw new Error(`Error creating verification code : ${error}`);
        }
    }
    public async findByCode(grandLineId: string, code: string) {
        try {
            const currentDateTime = new Date();
            const createdCode = await VerificationCode.findOne({
                where: {
                    email: grandLineId,
                    code: code,
                    expAt: {
                        [Op.gt]: currentDateTime
                    }
                }
            });
            return createdCode;

        } catch (error) {
            console.error("Error finding verification code:", error);
        }
    }
    public async findByUserId(id: number): Promise<VerificationCode | null> {
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
