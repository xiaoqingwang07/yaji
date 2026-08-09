export type ExplanationCitation = {
  kind: "REPORT" | "KNOWLEDGE";
  label: string;
  knowledgeEntryId?: string;
  pageNumber?: number;
};

export type PlainReadingItem = {
  id: string;
  text: string;
  citation: ExplanationCitation;
};

export type LlmExplainResult = {
  provider: string;
  requestId: string;
  items: PlainReadingItem[];
  suggestedNext: Array<{
    id: string;
    kind: "REMINDER" | "BRING" | "NOTE" | "MEDICATION";
    title: string;
    detail?: string;
  }>;
};

export type LlmStageSummaryResult = {
  provider: string;
  requestId: string;
  result: Record<string, unknown>;
  simplifiedText: string;
};

export interface LlmProvider {
  readonly name: string;
  explainReport(input: {
    rawText: string;
    fields: Array<{ label: string; value?: string }>;
    knowledgeHints: Array<{ id: string; title: string; plainText: string }>;
  }): Promise<LlmExplainResult>;
  summarizeStage(input: {
    facts: Array<{ date: string; title: string; detail?: string }>;
  }): Promise<LlmStageSummaryResult>;
}
