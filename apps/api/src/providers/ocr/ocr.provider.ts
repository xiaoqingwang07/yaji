export type OcrPageResult = {
  pageNumber: number;
  text: string;
  failed?: boolean;
};

export type OcrRecognizeResult = {
  provider: string;
  requestId: string;
  rawText: string;
  pages: OcrPageResult[];
  suggestedCategory?: string;
  suggestedTitle?: string;
  fields: Array<{
    label: string;
    value?: string;
    unit?: string;
    referenceRange?: string;
    confidence: number;
    fieldType: "KEY_VALUE" | "MEASUREMENT" | "TEXT" | "TABLE_CELL";
    pageNumber?: number;
  }>;
};

export interface OcrProvider {
  readonly name: string;
  recognize(input: {
    familyId: string;
    reportId: string;
    storageKeys: string[];
  }): Promise<OcrRecognizeResult>;
}
