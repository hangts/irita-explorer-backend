import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ProfilerSchema} from "../schema/profiler.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Profiler',
                schema: ProfilerSchema,
                collection: 'ex_profiler'
            }
        ])
    ],
    providers: [],
    exports: []
})
export class ProfilerModule {

}
