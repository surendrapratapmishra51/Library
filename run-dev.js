import { spawn } from 'child_process';

console.log('⚡ Starting Digital Library (Backend + Frontend)...');

// 1. Start Backend Server with auto-reload
const server = spawn('npx', ['tsx', 'watch', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

// 2. Start Frontend Vite Dev Server
const vite = spawn('npx', ['vite', '--port=3000', '--host=0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

const cleanup = () => {
  server.kill();
  vite.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
