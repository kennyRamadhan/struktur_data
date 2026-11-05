import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT) || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'struktur-data-playground-secret';
export const DB_PATH = process.env.DB_PATH || path.resolve(here, '../data/app.db');
export const CLIENT_DIST = path.resolve(here, '../../client/dist');

/** Kapasitas maksimum stack & queue milik setiap user. */
export const CAPACITY = 8;
