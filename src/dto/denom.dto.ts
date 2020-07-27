export class DenomResDto {
    name: string;
    schema: string;
    creator: string;
    denom_name: string;

    constructor(name: string, schema: string, creator: string, denom_name:string){
        this.name = name;
        this.denom_name = denom_name;
        this.schema = schema;
        this.creator = creator;
    }
}

export class DenomListResDto extends DenomResDto{
    constructor(name: string, schema: string, creator: string, denom_name:string){
        super(name, schema, creator, denom_name);
    }
}