import { Response } from 'express';

export function jsonError(res: Response, status: number, message: string) {
  return res.status(status).json({ error: message });
}

export function jsonServerError(
  res: Response,
  err: unknown,
  publicMessage: string = 'Internal server error'
) {
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction
    ? publicMessage
    : (err instanceof Error ? err.message : (err ? String(err) : publicMessage));
  return res.status(500).json({ error: message });
}

export function jsonValidationErrors(res: Response, errors: any[]) {
  return res.status(400).json({ errors });
}
