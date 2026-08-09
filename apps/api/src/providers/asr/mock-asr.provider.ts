import { randomUUID } from "node:crypto";
import { AsrProvider, AsrTranscribeResult } from "./asr.provider";

export class MockAsrProvider implements AsrProvider {
  readonly name = "mock";

  async transcribe(): Promise<AsrTranscribeResult> {
    return {
      provider: this.name,
      requestId: `mock-asr-${randomUUID()}`,
      transcript:
        "（演示转写）医生说：注意休息，按时复查。用药：叶酸每日一片。下次检查：四周后产检。",
      segments: [
        { startMs: 0, endMs: 4000, text: "注意休息，按时复查。" },
        { startMs: 4000, endMs: 8000, text: "用药：叶酸每日一片。" },
        { startMs: 8000, endMs: 12000, text: "下次检查：四周后产检。" },
      ],
    };
  }
}
