import { Global, Module } from "@nestjs/common";
import { ASR_PROVIDER, LLM_PROVIDER, OCR_PROVIDER, SMS_PROVIDER } from "./tokens";
import { MockSmsProvider } from "./sms/mock-sms.provider";
import { MockOcrProvider } from "./ocr/mock-ocr.provider";
import { MockLlmProvider } from "./llm/mock-llm.provider";
import { MockAsrProvider } from "./asr/mock-asr.provider";

@Global()
@Module({
  providers: [
    MockSmsProvider,
    { provide: SMS_PROVIDER, useExisting: MockSmsProvider },
    { provide: OCR_PROVIDER, useClass: MockOcrProvider },
    { provide: LLM_PROVIDER, useClass: MockLlmProvider },
    { provide: ASR_PROVIDER, useClass: MockAsrProvider },
  ],
  exports: [SMS_PROVIDER, OCR_PROVIDER, LLM_PROVIDER, ASR_PROVIDER, MockSmsProvider],
})
export class ProvidersModule {}
