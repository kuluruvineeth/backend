import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { ApiKeyAuthGuard } from './auth/guard/apiKey-auth.guard';
import { ISOLogger } from './logger/isoLogger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(await app.resolve(ISOLogger));

  //Security
  app.useGlobalGuards(new ApiKeyAuthGuard());
  app.enableCors();
  app.use(helmet());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  // OpenApi swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Organize Simple API')
    .setContact(
      'Kuluru Vineeth',
      'https://github.com/kuluruvineeth',
      'kuluruvineeth8623@gmail.com',
    )
    .setDescription(
      'Organize Simple is an API that allows you to organize your data in a way that is easy to use and understand with the power of large language models.',
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
        description: 'API key for authentication of registered applications',
      },
      'apiKey',
    )
    .addTag('organize-simple')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
