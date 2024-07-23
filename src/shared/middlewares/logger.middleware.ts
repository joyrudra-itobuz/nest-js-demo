import { format } from 'date-fns';
import { Request, Response, NextFunction } from 'express';

export default function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { headers, url, originalUrl } = req;
  const date = format(new Date(), 'dd/MM/yyyy hh:mm:ss');
  console.log({ headers, url, originalUrl, date });
  next();
}
