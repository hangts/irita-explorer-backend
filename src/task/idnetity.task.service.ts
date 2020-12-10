import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {hubDefaultEmptyValue, IdentityLimitSize, PubKeyAlgorithm, TxType} from '../constant';
import {
    IIdentityCertificateStruct,
    IIdentityPubKeyStruct,
    IIdentityStruct, IUpDateIdentityCredentials,
} from '../types/schemaTypes/identity.interface';
import {getTimestamp} from '../util/util';
import md5 from 'blueimp-md5';
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
        const pubkeyMd5Hash = md5(JSON.stringify(value.msg.pubkey.pubkey))
        const certificate_hash = ''
        const pubkeyData: IIdentityPubKeyStruct = {
            identities_id: value.msg.id,
            pubkey: {
                pubkey: value.msg.pubkey.pubkey,
                algorithm: PubKeyAlgorithm[value.msg.pubkey.algorithm],
            },
            certificate_hash: certificate_hash,
            hash: item.tx_hash,
            height: item.height,
            time: item.time,
            pubkey_hash: pubkeyMd5Hash,
            'msg_index': index,
            create_time:getTimestamp(),
        }
        return pubkeyData

    }
    handlePubKeyByCertificate(item: any, value:any,index: number){
        const pubkeyMd5Hash = md5(JSON.stringify(value.msg.ex.cert_pub_key.pubkey))
        const certificate_hash = md5(JSON.stringify(value.msg.ex.cert_pub_key.pubkey))
        const updatePubKeyByCertificate:IIdentityPubKeyStruct = {
            identities_id: value.msg.id,
            pubkey: {
                pubkey: value.msg.ex.cert_pub_key.pubkey,
                algorithm: PubKeyAlgorithm[value.msg.ex.cert_pub_key.algorithm],
            },
            certificate_hash: certificate_hash,
            hash: item.tx_hash,
            height: item.height,
            time: item.time,
            pubkey_hash: pubkeyMd5Hash,
            'msg_index': index,
            create_time:getTimestamp(),
        }
        return updatePubKeyByCertificate
    }
    handleCertificate(item: any, value: any, index: number) {
        const certificate_hash = md5(value.msg.certificate)
        const certificateData: IIdentityCertificateStruct = {
            identities_id: value.msg.id,
            certificate: value.msg.certificate,
            certificate_hash:certificate_hash,
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
        if (value.msg.credentials && value.msg.credentials !== hubDefaultEmptyValue) {
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
        const txlist = await this.txModel.queryListByCreateAndUpDateIdentity(height+1, limitSize)
        const identityInsertData: any = [], identityUpdateData: any = [], pubkeyInsertData: any = [],
            certificateInsertData: any = [], pubKeyByCertificateData: any = []
        for (const item of txlist) {
            for (let msgIndex: number = 0; msgIndex < item.msgs.length; msgIndex++) {
                let value: any = item.msgs[msgIndex]
                if (value.type === TxType.create_identity) {
                    //ex_sync_identity identity
                    const insertData: IIdentityStruct = await this.handleCreateIdentity(item, value)
                    identityInsertData.push(insertData)
                    console.log('先执行')
                    //ex_sync_identity_pubkey   pubkey
                    if (value.msg.pubkey) {
                        const pubkeyData: IIdentityPubKeyStruct = await this.handlePubkey(item, value, msgIndex)
                        pubkeyInsertData.push(pubkeyData)
                    }

                    // ex_sync_identity_certificate certificate
                    if (value.msg.certificate) {
                        const certificateData: IIdentityCertificateStruct = await this.handleCertificate(item, value, msgIndex)
                        certificateInsertData.push(certificateData)
                    }

                    if (value.msg.ex && value.msg.ex.cert_pub_key && value.msg.ex.cert_pub_key.pubkey) {
                        const pubKeyByCertificate: IIdentityPubKeyStruct = await this.handlePubKeyByCertificate(item, value, msgIndex)
                        pubKeyByCertificateData.push(pubKeyByCertificate)
                    }

                } else if (value.type === TxType.update_identity) {

                    //ex_sync_identity update identity
                    const updateData = this.handleUpdateIdentity(item, value)
                    identityUpdateData.unshift(updateData)

                    //ex_sync_identity_pubkey   pubkey
                    if (value.msg.pubkey) {
                        const pubkeyData: IIdentityPubKeyStruct = await this.handlePubkey(item, value, msgIndex)
                        pubkeyInsertData.push(pubkeyData)
                    }

                    // ex_sync_identity_certificate certificate
                    if (value.msg.certificate) {
                        const certificateData: IIdentityCertificateStruct = await this.handleCertificate(item, value, msgIndex)
                        certificateInsertData.push(certificateData)
                    }

                    if (value.msg.ex && value.msg.ex.cert_pub_key && value.msg.ex.cert_pub_key.pubkey) {
                        const pubKeyByCertificate: IIdentityPubKeyStruct = await this.handlePubKeyByCertificate(item, value, msgIndex)
                        pubKeyByCertificateData.push(pubKeyByCertificate)
                    }
                }
            }
        }
        let newIdentityUpdateDataMap = new Map();
        identityUpdateData.forEach((data) => {
            let identity = {...data};
            let currentIdentity = newIdentityUpdateDataMap.get(data.identities_id) || {};
            if (!identity.credentials) {
                identity.credentials = currentIdentity.credentials || hubDefaultEmptyValue;
            }
            newIdentityUpdateDataMap.set(data.identities_id,identity);
        });
        identityInsertData.length ? await this.identityTaskModel.insertIdentityInfo(identityInsertData) : ''
        newIdentityUpdateDataMap.forEach((item: IUpDateIdentityCredentials) => {
            this.identityTaskModel.updateIdentityInfo(item)
        })
        //
        pubkeyInsertData.sort((a:IIdentityPubKeyStruct,b:IIdentityPubKeyStruct) => {
            return a.height - b.height
        })

        pubKeyByCertificateData.sort((a:IIdentityPubKeyStruct,b:IIdentityPubKeyStruct) => {
            return a.height - b.height
        })

        certificateInsertData.sort((a:IIdentityCertificateStruct,b:IIdentityCertificateStruct) => {
            return a.height - b.height
        })

        await pubkeyInsertData.forEach( (item:IIdentityPubKeyStruct) => {
            this.pubkeyModel.insertPubkey(item)
        })

        await pubKeyByCertificateData.forEach( (item:IIdentityPubKeyStruct) => {
            this.pubkeyModel.insertPubkey(item)
        })
        await certificateInsertData.forEach( (item:IIdentityCertificateStruct) => {
            this.certificateModel.insertCertificate(item)
        })
    }
}
