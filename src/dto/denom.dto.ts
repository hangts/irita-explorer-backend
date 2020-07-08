export class DenomResDto {
    name: string;
    schema: string;
    creator: string;

    constructor(name: string, schema: string, creator: string){
        this.name = name;
        this.schema = schema;
        this.creator = creator;
    }
}

export class DenomListResDto extends DenomResDto{
    constructor(name: string, schema: string, creator: string){
        super(name, schema,creator);
    }
}

