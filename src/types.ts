export type LogType = 'info' | 'success' | 'warning' | 'error' | 'system' | 'step';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: LogType;
}

export type SynthesisStatus = 'idle' | 'parsing' | 'compiling' | 'verifying' | 'solving' | 'success' | 'error';

export interface TestCase {
  id: string;
  inputs: string;
  expected: string;
}

export interface VerifiedFunction {
  id: string;
  name: string;
  task: string;
  code: string;
  testCases: TestCase[];
  timestamp: number;
  hash: string;
}
