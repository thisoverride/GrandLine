import { Model, Table, AutoIncrement, PrimaryKey, Column, AllowNull, NotEmpty, Unique } from "sequelize-typescript";

export interface UserAttributes {
    id?: number;
    status: string;
    first_name: string;
    last_name: string;
    grand_line_id: string;
    password: string;
}

@Table({
    tableName: "users",
    timestamps: true,
    schema: "grandline",
})
export default class User extends Model<UserAttributes> {
    
    @AutoIncrement
    @PrimaryKey
    @Column
    override id!: number;
    
    @AllowNull(false)
    @NotEmpty
    @Column
    last_name!: string;

    @AllowNull(false)
    @NotEmpty
    @Column
    status!: string;

    @AllowNull(false)
    @NotEmpty
    @Column
    first_name!: string;

    @AllowNull(false)
    @NotEmpty
    @Unique 
    @Column
    grand_line_id!: string;

    @AllowNull(false)
    @NotEmpty
    @Column
    password!: string;
}
