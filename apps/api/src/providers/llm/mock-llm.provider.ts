import { randomUUID } from "node:crypto";
import { LlmExplainResult, LlmProvider, LlmStageSummaryResult } from "./llm.provider";

/**
 * 演示用 LLM：只做模板化事实复述 + 知识库出处，不输出行动建议或医生评判。
 */
export class MockLlmProvider implements LlmProvider {
  readonly name = "mock";

  async explainReport(input: {
    rawText: string;
    fields: Array<{ label: string; value?: string }>;
    knowledgeHints: Array<{ id: string; title: string; plainText: string }>;
  }): Promise<LlmExplainResult> {
    const requestId = `mock-llm-${randomUUID()}`;
    const items = [];
    const conclusion = input.fields.find((f) => /结论|印象|意见/.test(f.label));
    if (conclusion?.value) {
      items.push({
        id: randomUUID(),
        text: `报告写道：${conclusion.value}`,
        citation: {
          kind: "REPORT" as const,
          label: "报告原文",
          pageNumber: 1,
        },
      });
    } else if (input.rawText.trim()) {
      items.push({
        id: randomUUID(),
        text: "已识别到报告文字。请对照原图核对日期、医院与关键结论后再归档。",
        citation: { kind: "REPORT" as const, label: "报告原文", pageNumber: 1 },
      });
    }

    const hint = input.knowledgeHints[0];
    if (hint) {
      items.push({
        id: randomUUID(),
        text: hint.plainText,
        citation: {
          kind: "KNOWLEDGE" as const,
          label: `知识库：${hint.title}`,
          knowledgeEntryId: hint.id,
        },
      });
    }

    if (items.length === 0) {
      items.push({
        id: randomUUID(),
        text: "不确定，请核对原报告。",
        citation: { kind: "REPORT" as const, label: "报告原文" },
      });
    }

    return {
      provider: this.name,
      requestId,
      items,
      suggestedNext: [
        {
          id: randomUUID(),
          kind: "NOTE",
          title: "把下次检查时间记进档案",
          detail: "若报告或医生有说明，可在确认页采纳为提醒（非诊疗建议）。",
        },
      ],
    };
  }

  async summarizeStage(input: {
    facts: Array<{ date: string; title: string; detail?: string }>;
  }): Promise<LlmStageSummaryResult> {
    const requestId = `mock-llm-summary-${randomUUID()}`;
    const timeline = input.facts.map((f) => ({
      date: f.date,
      title: f.title,
      place: undefined as string | undefined,
    }));
    return {
      provider: this.name,
      requestId,
      result: {
        timeline,
        metrics: [],
        conclusions: input.facts
          .filter((f) => f.detail)
          .slice(0, 5)
          .map((f) => ({ quote: f.detail, source: f.title })),
        notes: [],
        openFollowUps: [],
        repeated: [],
      },
      simplifiedText:
        input.facts.length === 0
          ? "这段时间还没有已确认的档案记录。"
          : `这段时间共有 ${input.facts.length} 条已确认记录，详见时间线分区（仅汇总原文事实）。`,
    };
  }
}
