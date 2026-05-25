import { Response } from 'express';

export const handleError = (res: Response, err: any, context: string) => {
  console.error(`[ERROR] ${context}:`, err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (err.code === '23505') {
    return res.status(409).json({ message: 'Duplicate entry detected' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ message: 'Related record does not exist' });
  }

  if (err.code === '22P02') {
    const isProduction = process.env.NODE_ENV === 'production';

    return res.status(400).json({
      message: 'Invalid input format',
      ...(isProduction
        ? {}
        : {
            error: err.message,
            detail: err.detail,
            where: err.where,
            hint: err.hint,
          }),
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large' });
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(500).json({
    message: 'Server error occurred',
    ...(isProduction ? {} : { error: err.message, stack: err.stack })
  });
};
