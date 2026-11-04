import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://admin:admin123@localhost:5432/sleeply_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'sleeply_default_dev_jwt_secret_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  N8N_BASE_URL: process.env.N8N_BASE_URL || 'https://n8n-dev1.auto-node.tech',
  N8N_WORKFLOWS_URL: process.env.N8N_WORKFLOWS_URL || 'https://n8n-dev1.auto-node.tech/home/workflows',
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || 'https://n8n-dev1.auto-node.tech/webhook/sleeply-chat-principal',
  N8N_API_KEY: process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYjQyMGNmMS05OTk0LTQxNDQtODc1NS0xNDU0YmZiODY4YmMiLCJpc3MiOiJuOG4iLCJqdGkiOiJkN2M4ZTRlMS1hZjJmLTQ1NDYtODYxZS1mNGE1ZGJkNWQwZDQiLCJpYXQiOjE3OTM3NDkyMTIsImV4cCI6MTc5NjI1NjAwMCwiYXVkIjoicHVibGljLWFwaSJ9._I8D9sbO9h0SbrBmWldsV9xO7uFKILM4sMaAmpov3RY',
  META_AI_API_KEY: process.env.META_AI_API_KEY || 'LLM_1100897329385694_US1xzhgQHoicNjRmDDXXngs0C5I',
  OPENCLAW_BASE_URL: process.env.OPENCLAW_BASE_URL || 'http://127.0.0.1:18789',
  OPENCLAW_TOKEN: process.env.OPENCLAW_TOKEN || 'AA4991A11F0D574C0096CD7B277AE17BC8EA063CED562E1BF86B561A988A7EC8',
  OPENCLAW_MODEL: process.env.OPENCLAW_MODEL || 'openclaw',
  OPENCLAW_ENABLED: process.env.OPENCLAW_ENABLED !== 'false',
};
