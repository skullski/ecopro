import { RequestHandler } from "express";

// Minimal validation middlewares (no-op) to keep server functional after feature removals.
export const registerValidation: RequestHandler = (_req, _res, next) => next();
export const loginValidation: RequestHandler = (_req, _res, next) => next();

export const validate: RequestHandler = (_req, _res, next) => next();

export default {};
