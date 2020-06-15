import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ValidatorsService } from "../service/validator.service";
import { ValidatorsModel } from '../schema/validators.schema';
import { ValidatorsController }  from "../controller/validators.controller"

@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name:'validators',
                schema:ValidatorsModel,
                collection:'ex_sync_validator'
            }
        ])
    ],
    providers: [ ValidatorsService ],
    controllers: [ ValidatorsController ]
})

export class ValidatorsModule { }


