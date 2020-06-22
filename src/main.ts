import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import cluster from 'cluster';
import os from 'os';
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const options = new DocumentBuilder()
        .setTitle('Tx example')
        .setDescription('The tx API description')
        .setVersion('1.0')
        .addTag('tx')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
    app.enableCors();
    if (cluster.isMaster) {
        //the only thing to for master process is forking child process
        console.log(`主进程 ${process.pid} 正在运行`);
        for (let i = 0; i < os.cpus().length; i++) {
            cluster.fork();
        }
        cluster.on('exit', (worker) => {
            new Logger('Main.ts').error(`工作进程 ${worker.process.pid} 已退出`);
        });
    } else {
        await app.listen(3000);
        console.log(`工作进程 ${process.pid} 已启动`);
    }
}
bootstrap();
