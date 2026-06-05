export type LogType = 'info' | 'success' | 'warning' | 'error' | 'system' | 'step';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: LogType;
}

export type SynthesisStatus = 'idle' | 'parsing' | 'compiling' | 'verifying' | 'solving' | 'success' | 'error';

export interface VerifiedFunction {
  id: string;
  name: string;
  task: string;
  code: string;
  testCases: number;
  timestamp: number;
  hash: string;
}
