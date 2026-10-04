import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Keep validation simple: strip unknown fields and transform payloads.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger UI at GET /api. "addBearerAuth" lets you paste a JWT with the
  // Authorize button so you can try the protected endpoints from the browser.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS IDOR Security Lab')
    .setDescription(
      'Intentionally vulnerable local university lab for Broken Access Control / IDOR.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Listen on 0.0.0.0 so the Kali VM can reach the API, not just localhost.
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
