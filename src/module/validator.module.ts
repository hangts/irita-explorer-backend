import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ValidatorService } from "../service/validator.service";
import { ValidatorSchema } from '../schema/validators.schema';
import { ValidatorsController }  from "../controller/validators.controller"

@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name:'Validators',
                schema:ValidatorSchema,
                collection:'ex_sync_validator'
            }
        ])
    ],
    providers: [ ValidatorService ],
    controllers: [ ValidatorsController ]
})

export class ValidatorModule { }


