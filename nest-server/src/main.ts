import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });
  const port = process.env.PORT ?? 5001;
  await app.listen(port);
  console.log(`🚀 Nest server ready at http://localhost:${port}/graphql`);
}
await bootstrap();
