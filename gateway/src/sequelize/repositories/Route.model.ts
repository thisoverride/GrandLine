import { Model, Table, AutoIncrement, PrimaryKey, Column, AllowNull, NotEmpty, Unique } from "sequelize-typescript";

export interface PathI{
    id?: number
    path: string
    port: number
}

@Table(
    {
        tableName: "routes",
        timestamps: true
    }
)
export default class Paths extends Model implements PathI{
    
    @AutoIncrement
    @PrimaryKey
    @Column
    override id!: number

    @AllowNull(false)
    @NotEmpty
    @Column
    path!: string;
    
    @AllowNull(true)
    @NotEmpty
    @Column
    port!: number
}