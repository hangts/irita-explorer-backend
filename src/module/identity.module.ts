import { IdentitySchema } from '../schema/identity.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityService } from '../service/identity.service';
import { IdentityController } from '../controller/identity.controller';
import { PubkeySchema } from '../schema/pubkey.schema';
import { CertificateSchema } from '../schema/certificate.schema';
import {TxModule} from "./tx.module";

@Module({
  imports:[
    MongooseModule.forFeature([{
      name: 'Identity',
      schema: IdentitySchema,
      collection: 'ex_sync_identity'
    },{
      name:'Pubkey',
      schema:PubkeySchema,
      collection: 'ex_sync_identity_pubkey'
    },{
      name:'Certificate',
      schema: CertificateSchema,
      collection: 'ex_sync_identity_certificate'
    }]),
    TxModule
  ],
  providers:[IdentityService],
  controllers:[IdentityController],
})
export class IdentityModule{}
