import { IQueryBase } from '.';
import { Document } from 'mongoose';



export interface IDenom extends Document {
    name:string;
    json_schema:string;
    creator:string;
}

export interface IDenomQueryParams extends IQueryBase {
}

abstract class A {
    getDenomList(denom: string): string;
    getDenomList(owner: string): string{
        return ''
    }
}

class B extends A{
    getDenomList(denom: string):string{
        return 'hello'
    }


}