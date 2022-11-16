import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import {
    BlockListReqDto,
    BlockDetailReqDto,
    ValidatorsetsReqDto,
    RangeBlockReqDto } from '../dto/block.dto';
import {
    BlockListResDto,
    ValidatorsetsResDto,
    BlockStakingResDto} from '../dto/block.dto';
import { IBlock, IBlockStruct } from '../types/schemaTypes/block.interface';
import { BlockHttp } from '../http/lcd/block.http';
import { Logger } from '../logger';
import { addressPrefix } from '../constant';
import { getAddress, hexToBech32 } from '../util/util';
import { getConsensusPubkey } from '../helper/staking.helper';
import { Validatorset } from '../dto/http.dto';

@Injectable()
export class BlockService {

    constructor(
        @InjectModel('Block') private blockModel: Model<IBlock>,
        @InjectModel('StakingValidator') private stakingValidatorModel: any) {}

    async queryRangeBlockList(query: RangeBlockReqDto): Promise<ListStruct<BlockListResDto[]>> {
      const { start, end, useCount } = query;
      let count = null, res = [];

      if(start && end){
        const blocks: IBlockStruct[] = await (this.blockModel as any).findListByRange(start, end);

        const allValidators = await this.stakingValidatorModel.queryAllValidators();
        const validators = new Map();
        allValidators.forEach(validator => {
            validators.set(validator.proposer_addr,validator)
        });

        res = blocks.map(block => {
        block = JSON.parse(JSON.stringify(block));
        const proposer = validators.get(block.proposer);
        let proposer_addr, proposer_moniker;
        if (proposer) {
            proposer_moniker = proposer.is_black ?  proposer.moniker_m : (proposer.description || {}).moniker || '';
            proposer_addr = proposer.operator_address || '';
        }
        return {
            height: block.height,
            hash: block.hash,
            txn: block.txn,
            time: block.time,
            proposer_addr,
            proposer_moniker
        }
        });
      }

      if (useCount) {
        count = await (this.blockModel as any).findCount();
      }
      return new ListStruct(res, start, end, count);     
    }

    async queryBlockList(query: BlockListReqDto): Promise<ListStruct<BlockListResDto[]>> {
        const { pageNum, pageSize, useCount } = query;
        let count: number;
        const blocks: IBlockStruct[] = await (this.blockModel as any).findList(pageNum, pageSize);
        if (useCount) {
            count = await (this.blockModel as any).findCount();
        }
        const allValidators = await this.stakingValidatorModel.queryAllValidators();
        const validators = new Map();
        allValidators.forEach(validator => {
            validators.set(validator.proposer_addr,validator)
        });
        const res: BlockListResDto[] = blocks.map(block => {
            block = JSON.parse(JSON.stringify(block));
            const proposer = validators.get(block.proposer);
            let proposer_addr, proposer_moniker;
            if (proposer) {
                proposer_moniker = proposer.is_black ?  proposer.moniker_m : (proposer.description || {}).moniker || '';
                proposer_addr = proposer.operator_address || '';
            }
            return {
                height: block.height,
                hash: block.hash,
                txn: block.txn,
                time: block.time,
                proposer_addr,
                proposer_moniker
            }
        });
        // for (let block of blocks) {
        //     block = JSON.parse(JSON.stringify(block));
        //     let block_lcd = await BlockHttp.queryBlockFromLcd(block.height);
        //     if (block_lcd) {
        //         let proposer = await this.stakingValidatorModel.findValidatorByPropopserAddr(block.proposer || '');
        //         let validatorsets = await BlockHttp.queryValidatorsets(block.height);
        //         if (proposer && proposer.length) {
        //             block.proposer_moniker = (proposer[0].description || {}).moniker || '';
        //             block.proposer_addr = proposer[0].operator_address || '';
        //         }

        //         let signaturesMap:any = {};
        //         block_lcd.block.last_commit.signatures.forEach((item:any)=>{
        //             let address = hexToBech32(item.validator_address, addressPrefix.ica);
        //             signaturesMap[address] = item;
        //         }) 
        //         if (validatorsets) {
        //             block.total_validator_num = validatorsets ? validatorsets.length : 0;
        //             block.total_voting_power = 0;
        //             block.precommit_voting_power = 0;
        //             validatorsets.forEach((item)=>{
        //                 //TODO:hangtaishan 使用大数计算
        //                 block.total_voting_power += Number(item.voting_power || 0);
        //                 if (signaturesMap[item.address]) {
        //                     block.precommit_voting_power += Number(item.voting_power || 0);
        //                 }
        //             });
        //         }
        //         block.precommit_validator_num = 0;
        //         if (block_lcd) {
        //             try{
        //                 block.precommit_validator_num = block_lcd.block.last_commit.signatures.filter((item)=>{
        //                     return item.validator_address && item.validator_address.length;
        //                 }).length;
        //             }catch(e){
        //                 block.precommit_validator_num = 0;
        //             }
        //         }
        //     }
        //     res.push(new BlockListResDto(block));
        // }
        return new ListStruct(res, pageNum, pageSize, count);
    }

    async queryBlockDetail(p: BlockDetailReqDto): Promise<BlockListResDto | null> {
        let data: BlockListResDto | null = null;
        const { height } = p;
        const res: IBlockStruct | null = await (this.blockModel as any).findOneByHeight(height);
        if (res) {
            data = new BlockListResDto(res);
        }
        return data;
    }

    async queryAllValidatorset(height):Promise<Validatorset[]> {
        let allValidatorsets = [];
        let offset = 0;
        let validatorsets = await BlockHttp.queryValidatorsets(height);
        if(validatorsets && validatorsets.length > 0) {
            allValidatorsets = allValidatorsets.concat(validatorsets);
        }
        //判断是否有第二页数据 如果有使用while循环请求
        while (validatorsets && validatorsets.length === 100){
            offset+=100
            validatorsets = await BlockHttp.queryValidatorsets(height,offset);
            //将第二页及以后的数据合并
            allValidatorsets = allValidatorsets.concat(validatorsets)
        }
        return allValidatorsets
    }


    // blocks/staking/{height}
    async queryBlockStakingDetail(query: BlockDetailReqDto): Promise<BlockStakingResDto | null> {
        const { height } = query;
        let result: BlockStakingResDto | null = null;
        let data:any = {};
        let block_db = await (this.blockModel as any).findOneByHeight(height);
        block_db = JSON.parse(JSON.stringify(block_db));
        if (block_db) {
            const block_lcd = await BlockHttp.queryBlockFromLcd(height);
            const latestBlock = await BlockHttp.queryLatestBlockFromLcd();
            const proposer = await this.stakingValidatorModel.findValidatorByPropopserAddr(block_db.proposer || '');
            const allValidatorsets = await this.queryAllValidatorset(height);
            data = {
                height: block_db.height,
                hash: block_db.hash,
                txn: block_db.txn,
                time: block_db.time,
                proposer: block_db.proposer
            };

            if (proposer && proposer.length) {
                data.proposer_moniker = proposer[0].is_black ? proposer[0].moniker_m : (proposer[0].description || {}).moniker || '';
                data.proposer_addr = proposer[0].operator_address || '';
            }

            const signaturesMap:any = {};
            block_lcd.block.last_commit.signatures.forEach((item:any)=>{
                const address = hexToBech32(item.validator_address, addressPrefix.ica);
                signaturesMap[address] = item;
            }) 
            if (allValidatorsets) {
                data.total_validator_num = allValidatorsets ? allValidatorsets.length : 0;
                const icaAddr = hexToBech32(block_db.proposer, addressPrefix.ica);
                data.total_voting_power = 0;
                data.precommit_voting_power = 0;
                allValidatorsets.forEach((item)=>{
                    //TODO:hangtaishan 使用大数计算
                    data.total_voting_power += Number(item.voting_power || 0);
                    if (signaturesMap[item.address]) {
                        data.precommit_voting_power += Number(item.voting_power || 0);
                    }
                });
            }
            data.precommit_validator_num = 0;
            if (block_lcd) {
                try{
                    data.precommit_validator_num = block_lcd.block.last_commit.signatures.filter((item)=>{
                        return item.validator_address && item.validator_address.length;
                    }).length;
                }catch(e){
                    data.precommit_validator_num = 0;
                }
            }
            if (latestBlock) {
                data.latest_height = (latestBlock.block.header || {}).height;
            }
            result = new BlockStakingResDto(data);
        }
        return result;
    }

    // validatorset/{height}
    async queryValidatorset(query: ValidatorsetsReqDto): Promise<ListStruct<ValidatorsetsResDto[]>> {
        const { height, pageNum, pageSize, useCount } = query;

        const data_lcd = await this.queryAllValidatorset(height);
        const data = (data_lcd || []).slice((pageNum - 1) * pageSize, pageNum * pageSize);
        if (data && data.length) {
            let block = await (this.blockModel as any).findOneByHeight(Number(height));
            block = JSON.parse(JSON.stringify(block || '{}'));
            const validators = await this.stakingValidatorModel.queryAllValidators();
            if (validators.length) {
                const validatorMap = {};
                validators.forEach((v)=>{
                    validatorMap[v.proposer_addr] = v;
                });
                data.forEach((item)=>{
                    item.pub_key = getConsensusPubkey(item.pub_key['value'])
                    const proposer_addr = item.pub_key ? getAddress(item.pub_key).toLocaleUpperCase() : null
                    const validator = validatorMap[proposer_addr];
                    if (validator) {
                        (item as any).moniker = validator.is_black ? validator.moniker_m : (validator.description || {}).moniker || '';
                        (item as any).operator_address = validator.operator_address || '';
                        (item as any).is_proposer = (validator.proposer_addr == block.proposer)
                    }
                })
            }
        }
        return new ListStruct(ValidatorsetsResDto.bundleData(data), pageNum, pageSize, data_lcd.length);
    }

    async queryLatestBlock(): Promise<IBlockStruct> {
        try {
            const blockStruct: IBlockStruct | null = await this.queryLatestBlockFromLcd();
            if(blockStruct){
                return blockStruct;
            }else {
                return await this.queryLatestBlockFromDB();
            }
        } catch (e) {
            Logger.warn('api-error:', e.message);
            return await this.queryLatestBlockFromDB();
        }

    }

    private async queryLatestBlockFromDB(): Promise<IBlockStruct> {
        return await (this.blockModel as any).findOneByHeightDesc();
    }

    private async queryLatestBlockFromLcd(): Promise<IBlockStruct | null> {
        const blockStruct: IBlockStruct = {};
        const block = await (this.blockModel as any).findOneByHeightDesc();
        if(block?.height){
          blockStruct.dbHeight = block.height
        }

        const res = await BlockHttp.queryLatestBlockFromLcd();
        if(res && res.block_id && res.block && res.block.header && res.block.data){     
            blockStruct.height = res.block.header.height;
            blockStruct.time = res.block.header.time;
            blockStruct.txn = res.block.data.txs ? res.block.data.txs.length : 0;
            blockStruct.hash = res.block_id.hash;
            return blockStruct;
        }else {
            return null;
        }

    }
}
