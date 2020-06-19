import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { TaskDispatchService } from './task.dispatch.service';
import { TaskEnum } from '../constant';
import { ITaskDispatchStruct } from '../types/schemaTypes/task.dispatch.interface';

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
            const data: boolean = await taskDispatchService.needDoTask(TaskEnum.denom);
            expect(data).toBe(true);
        });
    });

    describe('registerTask', () => {
        it('should return register denom task', async () => {
            let str = String(Math.floor(Math.random()*1000000))
            const data: ITaskDispatchStruct = await taskDispatchService.registerTask((str as TaskEnum));
            expect(data).toBeDefined();
        });
    });

    describe('unlock', () => {
        it('should unlock', async () => {
            const data: any = await taskDispatchService.unlock(TaskEnum.denom);
            expect(data).toBeDefined();
        });
    });

    describe('taskDispatchFaultTolerance', () => {
        it('should check over time', async () => {
            await taskDispatchService.taskDispatchFaultTolerance();
        });
    });


});

