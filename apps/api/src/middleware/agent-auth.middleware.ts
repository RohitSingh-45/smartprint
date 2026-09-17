import { timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

export type AgentRequest = Request & { agentTokenVerified?: boolean };

/**
 * Shared-secret auth for the Local Print Agent.
 * Browser clients never receive this token.
 * Uses constant-time comparison to prevent timing-oracle attacks.
 */
export function requireAgentToken(req: AgentRequest, res: Response, next: NextFunction): void {
  const header =
    req.header('x-agent-token') || req.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (!env.printAgentToken) {
    res.status(503).json({
      error: 'Print agent token is not configured on the server.',
      code: 'AGENT_TOKEN_MISSING',
    });
    return;
  }
  if (!header) {
    res.status(401).json({ error: 'Invalid agent token.', code: 'AGENT_UNAUTHORIZED' });
    return;
  }

  // Constant-time comparison to prevent timing attacks.
  const expected = Buffer.from(env.printAgentToken);
  const provided = Buffer.from(header);
  const isValid =
    expected.length === provided.length && timingSafeEqual(expected, provided);

  if (!isValid) {
    res.status(401).json({ error: 'Invalid agent token.', code: 'AGENT_UNAUTHORIZED' });
    return;
  }
  req.agentTokenVerified = true;
  next();
}
