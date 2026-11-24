import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'JH Innovation Hub Core API',
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // Mount API Router FIRST
  app.use('/api', apiRouter);

  // Explicitly intercept any unhandled /api requests and return JSON 404
  // CRITICAL: This ensures unmatched /api requests never leak into Vite SPA middleware to return HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
      timestamp: new Date().toISOString(),
    });
  });

  // Global error handler for /api to guarantee JSON responses, never HTML
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.originalUrl.startsWith('/api')) {
      console.error(`[API Internal Error] ${req.method} ${req.originalUrl}:`, err);
      return res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString(),
      });
    }
    next(err);
  });

  // OAuth Callback Route (Complies with oauth-integration skill postMessage protocol)
  app.get('/auth/callback', (req, res) => {
    const provider = (req.query.provider as string) || 'google';
    const email = (req.query.email as string) || '';
    const name = (req.query.name as string) || '';
    const role = (req.query.role as string) || 'CITIZEN';
    const code = (req.query.code as string) || '';

    res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Authentication Successful</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
      .card { background: #131b2e; border: 1px solid #1e293b; padding: 28px; border-radius: 12px; text-align: center; max-width: 360px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
      .spinner { border: 3px solid rgba(255,255,255,0.1); border-left-color: #f97316; border-radius: 50%; width: 32px; height: 32px; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
      @keyframes spin { to { transform: rotate(360deg); } }
      h3 { margin: 0 0 8px; font-size: 18px; font-weight: 800; }
      p { margin: 0; font-size: 13px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="spinner"></div>
      <h3>Authentication Successful</h3>
      <p>Completing login with ${provider.toUpperCase()}... This window will close automatically.</p>
    </div>
    <script>
      const authData = {
        type: 'OAUTH_AUTH_SUCCESS',
        provider: ${JSON.stringify(provider)},
        email: ${JSON.stringify(email)},
        name: ${JSON.stringify(name)},
        role: ${JSON.stringify(role)},
        code: ${JSON.stringify(code)}
      };
      if (window.opener) {
        window.opener.postMessage(authData, '*');
        setTimeout(() => window.close(), 600);
      } else {
        window.location.href = '/';
      }
    </script>
  </body>
</html>`);
  });

  // OAuth Interactive Mock Authorization Window for Sandbox Environments
  app.get('/auth/oauth-mock', (req, res) => {
    const provider = (req.query.provider as string) || 'google';
    const role = (req.query.role as string) || 'CITIZEN';
    const email = (req.query.email as string) || (provider === 'google' ? 'swachh64@gmail.com' : `${provider}.user@jharkhand.in`);
    const name = (req.query.name as string) || (provider === 'google' ? 'Swachh Bharat Citizen' : `${provider.toUpperCase()} Innovator`);

    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sign in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; box-sizing: border-box; }
    .box { background: #fff; border: 2px solid #000; box-shadow: 6px 6px 0px #000; width: 100%; max-width: 440px; padding: 32px; box-sizing: border-box; }
    .badge { display: inline-block; background: #000; color: #fff; font-size: 11px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 8px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 6px; letter-spacing: -0.5px; }
    .sub { font-size: 13px; color: #64748b; margin: 0 0 20px; line-height: 1.4; }
    .user-pill { display: flex; items-center; gap: 12px; background: #f1f5f9; padding: 12px 14px; border: 1px solid #cbd5e1; margin-bottom: 20px; }
    .avatar { width: 38px; height: 38px; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; border-radius: 50%; }
    .user-info { flex: 1; }
    .user-name { font-weight: 800; font-size: 14px; margin: 0; }
    .user-email { font-size: 12px; color: #64748b; margin: 0; }
    .scopes { font-size: 12px; color: #334155; margin: 16px 0; background: #fff7ed; border: 1px solid #fed7aa; padding: 12px; }
    .scopes ul { margin: 6px 0 0 18px; padding: 0; }
    .scopes li { margin-bottom: 4px; }
    .actions { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
    .btn { width: 100%; padding: 12px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; border: 2px solid #000; text-align: center; box-sizing: border-box; }
    .btn-primary { background: #ea580c; color: #fff; box-shadow: 3px 3px 0px #000; }
    .btn-primary:hover { background: #c2410c; }
    .btn-secondary { background: #fff; color: #000; }
    .btn-secondary:hover { background: #f1f5f9; }
  </style>
</head>
<body>
  <div class="box">
    <div class="badge">JH INNOVATION HUB &bull; SSO</div>
    <h2 class="title">Authorize ${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign-In</h2>
    <p class="sub">Verify your identity and grant access to the Government of Jharkhand State Innovation Ecosystem.</p>

    <div class="user-pill">
      <div class="avatar">${name.charAt(0)}</div>
      <div class="user-info">
        <p class="user-name">${name}</p>
        <p class="user-email">${email}</p>
      </div>
    </div>

    <div class="scopes">
      <strong>JH Innovation Hub will access:</strong>
      <ul>
        <li>Your verified identity and email address</li>
        <li>State innovation portfolio & problem submission dashboard</li>
        <li>Active platform persona assignment (${role})</li>
      </ul>
    </div>

    <form method="GET" action="/auth/callback">
      <input type="hidden" name="provider" value="${provider}">
      <input type="hidden" name="email" value="${email}">
      <input type="hidden" name="name" value="${name}">
      <input type="hidden" name="role" value="${role}">
      <div class="actions">
        <button type="submit" class="btn btn-primary">Sign in with ${provider.toUpperCase()}</button>
        <button type="button" class="btn btn-secondary" onclick="window.close()">Cancel</button>
      </div>
    </form>
  </div>
</body>
</html>`);
  });

  // Vite middleware for development or static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JH Innovation Hub] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
