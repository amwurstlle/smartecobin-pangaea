// Vercel Serverless entry: wraps our Express app without server.listen
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { registerRoutes } from '../server/appRoutes';

let cachedApp: Express | null = null;

async function buildApp(): Promise<Express> {
  const app = express();

  // Basic CORS for browser clients
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Mount our API routes (ignore the returned Node server)
  await registerRoutes(app);

  return app;
}

async function getApp(): Promise<Express> {
  if (!cachedApp) {
    cachedApp = await buildApp();
  }
  return cachedApp;
}

export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  return (app as any)(req, res);
}
