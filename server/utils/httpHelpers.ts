import { Request, Response } from 'express';

export function jsonError(res: Response, status: number, message: string) {
  return res.status(status).json({ error: message });
}

export function jsonValidationErrors(res: Response, errors: any[]) {
  return res.status(400).json({ errors });
}
