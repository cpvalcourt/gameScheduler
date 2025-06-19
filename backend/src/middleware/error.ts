import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode || 500).json({
      message: err.message
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message,
      errors: (err as any).errors
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    message: 'Internal server error'
  });
}; 