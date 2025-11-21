import { POST as registerHandler } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';
import { describe, it, expect } from '@jest/globals';

describe('Auth Register', () => {
  it('should validate email format', async () => {
    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John',
        email: 'invalid-email', // Invalid
        password: 'SecurePass123',
      }),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('email');
  });

  it('should hash password', async () => {
    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John',
        email: 'john@example.com',
        password: 'SecurePass123',
      }),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user.password).toBeUndefined(); // Password should never be returned
  });
});