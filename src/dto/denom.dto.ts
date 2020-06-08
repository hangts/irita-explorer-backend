import { IsString, IsInt,  } from 'class-validator';

export class DenomDto {

}

export class DenomListResDto {
    private name: string;
    private schema: string;
    private creator: string;
    private createTime: number;
    private updateTime: number;

    constructor(name: string, schema: string, creator: string, updateTime: number, createTime: number){
        this.name = name;
        this.schema = schema;
        this.creator = creator;
        this.updateTime = updateTime;
        this.createTime = createTime;
    }
}

