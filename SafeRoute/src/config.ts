import 'dotenv/config';

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
export const ENVIRONMENT = process.env.ENVIRONMENT || 'development';
export const DEBUG = process.env.DEBUG === 'true';
export const APP_NAME = process.env.APP_NAME || 'SafeRoute';
