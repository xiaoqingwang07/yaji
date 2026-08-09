export type AsrTranscribeResult = {
  provider: string;
  requestId: string;
  transcript: string;
  segments?: Array<{ startMs: number; endMs: number; text: string }>;
};

export interface AsrProvider {
  readonly name: string;
  transcribe(input: {
    familyId: string;
    recordingId: string;
    storageKey: string;
  }): Promise<AsrTranscribeResult>;
}
