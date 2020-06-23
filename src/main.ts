import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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
    await app.listen(3000);
}
bootstrap();
