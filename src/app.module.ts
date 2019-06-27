import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilModule } from './util/util.module';

@Module({
  imports: [UtilModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
