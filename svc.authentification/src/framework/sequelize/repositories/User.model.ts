import { Model, Table, AutoIncrement, PrimaryKey, Column, AllowNull, NotEmpty } from "sequelize-typescript";

export interface UserI{
    id?: number
    firstname: string
    lastname: string
    grandLineId: string
    password: string
}

@Table(
    {
        tableName: "users",
        timestamps: true
    }
)
export default class User extends Model implements UserI{
    
    @AutoIncrement
    @PrimaryKey
    @Column
    override id!: number

    @AllowNull(false)
    @NotEmpty
    @Column
    lastname!: string;
    
    @AllowNull(false)
    @NotEmpty
    @Column
    firstname!: string

    @AllowNull(false)
    @NotEmpty
    @Column
    grandLineId!: string;

    @AllowNull(false)
    @NotEmpty
    @Column
    password!: string;

}