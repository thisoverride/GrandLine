import { Model, Table, AutoIncrement, PrimaryKey, Column, AllowNull, NotEmpty, ForeignKey, BelongsTo } from "sequelize-typescript";
import User from "./User.model"; 

interface VerificationCodeAttributes {
    id?: number;
    userId: number;
    email: string;
    code: string;
}

@Table({
    tableName: "verification_codes",
    timestamps: true,
    schema: "grandline",
})
export default class VerificationCode extends Model<VerificationCodeAttributes> {
    
    @AutoIncrement
    @PrimaryKey
    @Column
    override id!: number;

    @ForeignKey(() => User)
    @Column
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @AllowNull(false)
    @NotEmpty
    @Column
    email!: string;

    @AllowNull(false)
    @NotEmpty
    @Column
    code!: string;
}