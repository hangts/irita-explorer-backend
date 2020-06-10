import { cfg } from '../config';

export enum taskEnum {
    denom = 'sync_denom',
    nft = 'sync_nft',
    faultTolerane = 'faule_tolerance'
}

export const TaskInterval = new Map<taskEnum, any>([
    [taskEnum.denom, cfg.taskCfg.interval.denom],
    [taskEnum.nft, cfg.taskCfg.interval.nft],
    [taskEnum.faultTolerane, cfg.taskCfg.interval.faultTolerance],
]);