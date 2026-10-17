import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './config/db.js';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Start server and initialize DB
async function startServer() {
  try {
    console.log('[Server] Initializing MySQL Database...');
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 [Backend Server] Running on http://localhost:${PORT}`);
      console.log(`🔌 [API Endpoint] http://localhost:${PORT}/api/health`);
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    console.log('💡 Tip: Make sure your MySQL service is running on your machine on port', process.env.DB_PORT || 3306);
    process.exit(1);
  }
}

startServer();
