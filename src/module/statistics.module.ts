import { Module } from '@nestjs/common';
import { StatisticsController } from '../controller/statistics.controller';
import { StatisticsService } from '../service/statistics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlockSchema } from '../schema/block.schema';
import { StakingValidatorSchema } from "../schema/staking.validator.schema";
import { StatisticsSchema } from '../schema/statistics.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: 'Block',
            schema: BlockSchema,
            collection: 'sync_block'
        },
        {
            name: 'StakingSyncValidators',
            schema: StakingValidatorSchema,
            collection: 'ex_staking_validator'
        },{
                name: 'Statistics',
                schema: StatisticsSchema,
                collection: 'ex_statistics'
        }]),
    ],
    providers: [StatisticsService],
    controllers: [StatisticsController],
})
export class StatisticsModule { }
