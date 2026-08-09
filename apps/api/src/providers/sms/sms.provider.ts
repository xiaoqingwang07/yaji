export interface SmsProvider {
  readonly name: string;
  sendLoginCode(mobile: string, code: string): Promise<void>;
}
