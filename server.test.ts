import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from './server';

describe('Synthesis API', () => {
  it('should return 400 if no spec is provided', async () => {
    const response = await request(app)
      .post('/api/synthesize')
      .send({});
      
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'No specification provided.');
  });

  it('should return 400 for invalid YAML syntax', async () => {
    const invalidYamlStr = `
version: 1.0
kind: function
  - invalid
  yaml: [
    `;
    const response = await request(app)
      .post('/api/synthesize')
      .send({ spec: invalidYamlStr });
      
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid YAML spec syntax.');
  });

  it('should return 500 or fallback response when API key is missing', async () => {
    const validSpec = `
name: add
parameters:
  - name: a
    type: int
  - name: b
    type: int
return_type: int
    `;
    const response = await request(app)
      .post('/api/synthesize')
      .send({ spec: validSpec });
      
    if (response.status === 200) {
      expect(response.body).toHaveProperty('code');
      expect(response.body.code).toContain('def add(a: int, b: int) -> int:');
    } else {
      expect(response.status).toBe(500);
    }
  });
});
