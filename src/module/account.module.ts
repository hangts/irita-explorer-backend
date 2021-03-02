import {Module } from '@nestjs/common';
import {AccountController} from '../controller/account.controller';
import {AccountService} from '../service/account.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSchema } from '../schema/account.schema';

@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name: 'Account',
                schema: AccountSchema,
                collection: 'ex_account'
            }
        ]),
    ],
    providers:[AccountService],
    controllers:[AccountController],
})
export class AccountModule{}
