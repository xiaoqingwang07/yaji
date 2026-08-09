import { describe, expect, it } from "vitest";
import { MockLlmProvider } from "./mock-llm.provider";

describe("MockLlmProvider", () => {
  it("cites knowledge or report and avoids action advice verbs in template", async () => {
    const llm = new MockLlmProvider();
    const result = await llm.explainReport({
      rawText: "印象：胎盘 II 级",
      fields: [{ label: "超声印象", value: "胎盘 II 级" }],
      knowledgeHints: [
        {
          id: "term.placenta-grade",
          title: "胎盘分级",
          plainText: "胎盘分级是超声报告里对胎盘成熟度的描述方式。",
        },
      ],
    });
    expect(result.provider).toBe("mock");
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.some((i) => i.citation.kind === "KNOWLEDGE")).toBe(true);
    const joined = result.items.map((i) => i.text).join(" ");
    expect(joined).not.toMatch(/必须手术|一定要吃药|医生不对/);
  });
});
