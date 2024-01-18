import { Module } from '@nestjs/common';
import { LLMService } from './llm/llm.service';
import { JsonController } from './json/json.controller';
import { JsonService } from './json/json.service';

@Module({
  controllers: [JsonController],
  providers: [LLMService, JsonService],
})
export class OrganizedDataModule {}
