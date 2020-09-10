import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {IdentityLimitSize, TxType} from '../constant';
import {
    IIdentityCertificateStruct,
    IIdentityPubKeyStruct,
    IIdentityStruct, IUpDateIdentityCredentials,
} from '../types/schemaTypes/identity.interface';
import {getTimestamp} from '../util/util';
@Injectable()

export class IdentityTaskService {
    constructor(
        @InjectModel('Identity') private identityTaskModel: any,
        @InjectModel('Pubkey') private pubkeyModel: any,
        @InjectModel('Certificate') private certificateModel: any,
        @InjectModel('Tx') private txModel: any,
    ) {
        this.doTask = this.doTask.bind(this);
    }

    handleCreateIdentity(item: any, value: any) {
        const insertData: IIdentityStruct = {
            identities_id: value.msg.id,
            owner: value.msg.owner,
            credentials: value.msg.credentials,
            'create_block_height': item.height,
            'create_block_time': item.time,
            'create_tx_hash': item.tx_hash,
            'update_block_height': item.height,
            'update_block_time': item.time,
            'update_tx_hash': item.tx_hash,
            'create_time':getTimestamp(),
            'update_time':getTimestamp(),
        }
        return insertData
    }

    handlePubkey(item: any, value: any, index: number) {
        const pubkeyData: IIdentityPubKeyStruct = {
            identities_id: value.msg.id,
            pubkey: {
                pubkey: value.msg.pubkey.pubkey,
                algorithm: value.msg.pubkey.algorithm,
            },
            hash: item.tx_hash,
            height: item.height,
            time: item.time,
            'msg_index': index,
            create_time:getTimestamp(),
        }
        return pubkeyData

    }

    handleCertificate(item: any, value: any, index: number) {
        const certificateData: IIdentityCertificateStruct = {
            identities_id: value.msg.id,
            certificate: value.msg.certificate,
            hash: item.tx_hash,
            height: item.height,
            time: item.time,
            'msg_index': index,
            create_time:getTimestamp(),
        }
        return certificateData
    }

    handleUpdateIdentity(item: any, value: any) {
        let updateData: IUpDateIdentityCredentials
        if (value.msg.credentials) {
            updateData = {
                identities_id: value.msg.id,
                credentials: value.msg.credentials,
                'update_block_height': item.height,
                'update_block_time': item.time,
                'update_tx_hash': item.tx_hash,
                'update_time':getTimestamp()
            }
        } else {
            updateData = {
                identities_id: value.msg.id,
                'update_block_height': item.height,
                'update_block_time': item.time,
                'update_tx_hash': item.tx_hash,
                'update_time':getTimestamp()
            }
        }
        return updateData
    }

    async doTask(): Promise<void> {
        const height: number = await this.identityTaskModel.queryHeight() || 0
        const limitSize:number = IdentityLimitSize
        const txlist = await this.txModel.queryListByCreateAndUpDateIdentity(height,limitSize)
        const identityInsertData: any = [], identityUpdateData: any = [], pubkeyInsertData: any = [],
            certificateInsertData: any = []
        txlist.forEach(item => {
            item.msgs.forEach(async (value: any, msgIndex: number) => {
                if (value.type === TxType.create_identity) {
                    //ex_sync_identity identity
                    const insertData:IIdentityStruct = await this.handleCreateIdentity(item, value)
                    identityInsertData.push(insertData)

                    //ex_sync_identity_pubkey   pubkey
                    if (value.msg.pubkey) {
                        const pubkeyData:IIdentityPubKeyStruct = await this.handlePubkey(item, value, msgIndex)
                        pubkeyInsertData.push(pubkeyData)
                    }

                    // ex_sync_identity_certificate certificate
                    if (value.msg.certificate) {
                        const certificateData:IIdentityCertificateStruct = await this.handleCertificate(item, value, msgIndex)
                        certificateInsertData.push(certificateData)
                    }
                } else if (value.type === TxType.update_identity) {

                    //ex_sync_identity update identity
                    const updateData = this.handleUpdateIdentity(item, value)
                    identityUpdateData.unshift(updateData)

                    //ex_sync_identity_pubkey   pubkey
                    if (value.msg.pubkey) {
                        const pubkeyData:IIdentityPubKeyStruct = await this.handlePubkey(item, value, msgIndex)
                        pubkeyInsertData.push(pubkeyData)
                    }

                    // ex_sync_identity_certificate certificate
                    if (value.msg.certificate) {
                        const certificateData:IIdentityCertificateStruct = await this.handleCertificate(item, value, msgIndex)
                        certificateInsertData.push(certificateData)
                    }
                }
            })
        })
        let newIdentityUpdateDataMap = new Map();
        identityUpdateData.forEach((data) => {
            let identity = {...data};
            let currentIdentity = newIdentityUpdateDataMap.get(data.identities_id) || {};
            if (!identity.credentials) {
                identity.credentials = currentIdentity.credentials || '';
            }
            newIdentityUpdateDataMap.set(data.identities_id,identity);
        });
        await this.identityTaskModel.insertIdentityInfo(identityInsertData)
        newIdentityUpdateDataMap.forEach((item: IUpDateIdentityCredentials) => {
            this.identityTaskModel.updateIdentityInfo(item)
        })
        await this.pubkeyModel.insertPubkey(pubkeyInsertData)
        await this.certificateModel.insertCertificate(certificateInsertData)
    }
}
