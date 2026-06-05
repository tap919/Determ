import { generateId } from './utils';
import { TestCase } from '../types';

export interface VerificationResult {
  success: boolean;
  passed: number;
  total: number;
  errorTrace?: string;
  details: any[];
}

export async function runVerification(code: string, testCases: TestCase[]): Promise<VerificationResult> {
  try {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, testCases })
    });
    
    if (!res.ok) {
       const err = await res.json();
       throw new Error(err.error || "Verification failed on server");
    }
    
    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      passed: 0,
      total: testCases.length,
      errorTrace: `Verification Request Error: ${error.message}`,
      details: testCases.map(tc => ({
        id: tc.id,
        success: false,
        error: "Verification could not run due to server error."
      }))
    };
  }
}
