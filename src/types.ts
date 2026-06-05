export type LogType = 'info' | 'success' | 'error' | 'system' | 'step';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: LogType;
}

export type SynthesisStatus = 'idle' | 'parsing' | 'synthesizing' | 'verifying' | 'success' | 'error';
