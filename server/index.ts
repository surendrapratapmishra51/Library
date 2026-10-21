import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { syncDatabase } from './models/index.js';
import apiRouter from './routes/api.js';
import { securityHeaders } from './middleware/securityHeaders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Remove server footprint header
app.disable('x-powered-by');

// Explicit CORS Origin Allowlist
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  process.env.APP_URL,
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, server-to-server, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy violation: Origin ${origin} not permitted.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Apply HTTP Security Headers
app.use(securityHeaders);

// Parse JSON with defensive body size limit (prevents payload flood DoS)
app.use(express.json({ limit: '1mb' }));

// API Routes
app.use('/api', apiRouter);

// Global Error Handler (Sanitizes stack traces and error details)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Error]:', err.message);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: isProd ? 'An internal error occurred. Please contact library administration.' : (err.message || 'Internal server error.')
  });
});


// Start server and synchronize Sequelize DB
async function startServer() {
  try {
    console.log('[Server] Connecting & Synchronizing Sequelize Models...');
    await syncDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 [Backend Server] Running on http://localhost:${PORT}`);
      console.log(`🔌 [API Health] http://localhost:${PORT}/api/health`);
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    console.log('💡 Tip: Make sure your MySQL service is running on your machine on port', process.env.DB_PORT || 3306);
    process.exit(1);
  }
}

startServer();
