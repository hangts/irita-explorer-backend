import { Controller, Get} from '@nestjs/common';
import { Result } from '../api/ApiResult';
import {StatisticsResDto} from '../dto/statistics.dto';
import {StatisticsService} from '../service/statistics.service';


@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {
    }

    @Get()
    async queryBlockList(): Promise<Result<StatisticsResDto>> {
        const data: StatisticsResDto = await this.statisticsService.queryStatistics();
        return new Result<StatisticsResDto>(data);
    }

}