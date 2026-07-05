import fs from 'fs';
import path from 'path';
import { User, MarketItem } from '../types';

const DB_FILE = path.join(process.cwd(), 'src', 'db.json');

interface DatabaseSchema {
  users: Record<string, User & { passwordHash: string }>;
  otps: Record<string, { otp: string; expiresAt: number; lastSentAt: number }>;
  marketItems: MarketItem[];
}

const initialDb: DatabaseSchema = {
  users: {},
  otps: {},
  marketItems: [],
};

// Ensure database file exists
function ensureDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  }
}

export function readDb(): DatabaseSchema {
  ensureDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return initialDb;
  }
}

export function writeDb(data: DatabaseSchema) {
  ensureDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Haversine formula to calculate distance in km
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
