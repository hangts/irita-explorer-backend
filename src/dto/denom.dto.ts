export class DenomResDto {
    name: string;
    denom_id: string;
    schema: string;
    creator: string;

    constructor(name: string, denom_id: string, schema: string, creator: string){
        this.name = name;
        this.denom_id = denom_id;
        this.schema = schema;
        this.creator = creator;
    }
}

export class DenomListResDto extends DenomResDto{
    constructor(name: string, denom_id: string, schema: string, creator: string){
        super(name, denom_id, schema, creator);
    }
}