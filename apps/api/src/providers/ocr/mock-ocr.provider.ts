import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { OcrProvider, OcrRecognizeResult } from "./ocr.provider";

type Conf<T> = { value: T; confidence?: number };

export class MockOcrProvider implements OcrProvider {
  readonly name = "mock";

  async recognize(input: {
    familyId: string;
    reportId: string;
    storageKeys: string[];
  }): Promise<OcrRecognizeResult> {
    const fixturePath = path.resolve(process.cwd(), "../../fixtures/ocr/ultrasound.json");
    try {
      const raw = await readFile(fixturePath, "utf8");
      const sample = JSON.parse(raw) as {
        rawText?: string;
        reportTitle?: Conf<string> | string;
        suggestedCategory?: Conf<string> | string;
        conclusion?: Conf<string> | string;
        fields?: Array<{
          label: Conf<string> | string;
          value?: Conf<string> | string;
          unit?: Conf<string> | string;
          referenceRange?: Conf<string> | string;
          fieldType?: OcrRecognizeResult["fields"][number]["fieldType"];
          confidence?: number;
        }>;
        pages?: Array<{ pageNumber: number; rawText?: string; text?: string; success?: boolean }>;
      };

      const title = pickValue(sample.reportTitle);
      const category = pickValue(sample.suggestedCategory);
      const conclusion = pickValue(sample.conclusion);
      const rawText =
        sample.rawText ||
        [title, conclusion].filter(Boolean).join("\n") ||
        "（演示超声样本）";

      return {
        provider: this.name,
        requestId: `mock-ocr-${randomUUID()}`,
        rawText,
        pages:
          sample.pages?.map((p) => ({
            pageNumber: p.pageNumber,
            text: p.text ?? p.rawText ?? "",
            failed: p.success === false,
          })) ?? [{ pageNumber: 1, text: rawText }],
        suggestedCategory: category,
        suggestedTitle: title,
        fields: (sample.fields ?? []).map((f) => ({
          label: pickValue(f.label) ?? "字段",
          value: pickValue(f.value),
          unit: pickValue(f.unit),
          referenceRange: pickValue(f.referenceRange),
          confidence:
            f.confidence ??
            (typeof f.value === "object" && f.value && "confidence" in f.value
              ? (f.value.confidence ?? 0.8)
              : 0.8),
          fieldType: f.fieldType ?? "KEY_VALUE",
          pageNumber: 1,
        })),
      };
    } catch {
      return {
        provider: this.name,
        requestId: `mock-ocr-${randomUUID()}`,
        rawText: "（演示）未能匹配样本，请手动补录日期、医院与结论。",
        pages: input.storageKeys.map((_, i) => ({
          pageNumber: i + 1,
          text: "",
          failed: false,
        })),
        suggestedCategory: "OTHER",
        suggestedTitle: "未命名报告",
        fields: [
          {
            label: "报告日期",
            value: "",
            confidence: 0.2,
            fieldType: "KEY_VALUE",
            pageNumber: 1,
          },
        ],
      };
    }
  }
}

function pickValue<T>(input?: Conf<T> | T | null): T | undefined {
  if (input == null) return undefined;
  if (typeof input === "object" && input !== null && "value" in input) {
    return (input as Conf<T>).value;
  }
  return input as T;
}
