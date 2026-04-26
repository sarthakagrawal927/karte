import { createAuth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const GET = async (req: Request) => {
  const { GET: handler } = toNextJsHandler(createAuth().handler);
  return handler!(req);
};

export const POST = async (req: Request) => {
  const { POST: handler } = toNextJsHandler(createAuth().handler);
  return handler!(req);
};
