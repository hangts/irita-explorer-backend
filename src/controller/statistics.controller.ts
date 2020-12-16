import { Controller, Get,Query } from '@nestjs/common';
import { Result } from '../api/ApiResult';
import { StatisticsResDto,PledgeRateResDto } from '../dto/statistics.dto';
import { StatisticsService } from '../service/statistics.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {
    }

    @Get()
    async queryStatistics(@Query() query:string): Promise<Result<StatisticsResDto>> {
        const data: StatisticsResDto = await this.statisticsService.queryStatistics(query);
        return new Result<StatisticsResDto>(data);
    }

    @Get('/pledge_rate')
    async queryPledgeRate(): Promise<Result<PledgeRateResDto>> {
        const data: PledgeRateResDto = await this.statisticsService.queryPledgeRate();
        return new Result<PledgeRateResDto>(data);
    }
}