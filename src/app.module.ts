import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GptModule } from './gpt/gpt.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TiktokModule } from './tiktok/tiktok.module';
import { MetaModule } from './meta/meta.module';
import { HttpModule } from './http/http.module';
import { LinkedinModule } from './linkedin/linkedin.module';
import { WinstonLogsModule } from './winston-logs/winston-logs.module';
import { WhatsappModule } from './bot/whatsapp/whatsapp.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GptModule,
    CloudinaryModule,
    TiktokModule,
    MetaModule,
    HttpModule,
    LinkedinModule,
    WinstonLogsModule,
    WhatsappModule,
    DatabaseModule,
    AuthModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
