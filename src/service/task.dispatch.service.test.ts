import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { TaskDispatchService } from './task.dispatch.service';
import { taskEnum } from '../constant';
import { ITaskDispatchEntities } from '../types/task.dispatch.interface';

describe('taskDispatch module', () => {
    let taskDispatchService: TaskDispatchService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                AppModule,
            ],
        }).compile();
        taskDispatchService = module.get<TaskDispatchService>(TaskDispatchService);
    });

    describe('needDoTask', () => {
        it('should return true', async () => {
            const data: boolean = await taskDispatchService.needDoTask(taskEnum.denom);
            expect(data).toBe(true);
        });
    });

    describe('registerTask', () => {
        it('should return latest block height', async () => {
            const data: ITaskDispatchEntities = await taskDispatchService.registerTask(taskEnum.denom);
            expect(data).toBeDefined();
        });
    });

    describe('unlock', () => {
        it('should return block average time', async () => {
            const data: any = await taskDispatchService.unlock(taskEnum.denom);
            expect(data).toBeDefined();
        });
    });

    describe('taskDispatchFaultTolerance', () => {
        it('should return block average time', async () => {
            const data: boolean = await taskDispatchService.taskDispatchFaultTolerance();
            expect(data).toBe(true);
        });
    });


});

