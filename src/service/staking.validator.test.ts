import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import StakingValidatorService from "./staking.validator.service";

describe('stakingValidatorController', () => {
    let stakingValidatorService : StakingValidatorService
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports:[
                AppModule
            ]
        }).compile();
        stakingValidatorService = module.get<StakingValidatorService>(StakingValidatorService);
    });
    //TODO API /distribution/validators/:address
    // /commission_info
    // /validators/:address/delegations
    // /validators/:address/unbonding-delegations
    // /validators
    // /validators/:address
    // /account/:address

})

