import 'dotenv/config';

// ─── Session Handler ───────────────────────────────────────────────────────────

export const SESSION_ID = process.env.SESSION_ID || 'Neiman_quick-bright-lamp';

// ─── Bot Identity ──────────────────────────────────────────────────────────────
export const BOT_NAME = process.env.BOT_NAME || 'Luthor MD';
export const BOT_VERSION = process.env.BOT_VERSION || '1.0.0';
export const OWNER_NUMBER = process.env.OWNER_NUMBER || '254788687886';
export const OWNER_NAME = process.env.OWNER_NAME || 'Neiman Marcus';

// ─── Command Settings ──────────────────────────────────────────────────────────
export const PREFIX = process.env.PREFIX || '.';

// ─── Behaviour ─────────────────────────────────────────────────────────────────
// Helper function to parse boolean environment variables
const parseBool = (val, defaultValue = true) => {
    if (val === undefined || val === null || val === '') return defaultValue;
    return val.toLowerCase() !== 'false' && val !== '0';
};

export const AUTO_READ = parseBool(process.env.AUTO_READ);
export const AUTO_TYPING = parseBool(process.env.AUTO_TYPING);
export const REPLY_IN_DM_ONLY = parseBool(process.env.REPLY_IN_DM_ONLY, false);
export const OWNER_ONLY = parseBool(process.env.OWNER_ONLY, false);
export const AUTO_VIEW_STATUS = parseBool(process.env.AUTO_VIEW_STATUS);
export const AUTO_LIKE_STATUS = parseBool(process.env.AUTO_LIKE_STATUS);
export const WELCOME = parseBool(process.env.WELCOME);
export const GOODBYE = parseBool(process.env.GOODBYE);
export const ANTI_DELETE = parseBool(process.env.ANTI_DELETE);
export const ANTI_LINK = parseBool(process.env.ANTI_LINK);

export const WELCOME_MESSAGE = process.env.WELCOME_MESSAGE || '👋 Welcome @{name} to the group!';
export const GOODBYE_MESSAGE = process.env.GOODBYE_MESSAGE || '👋 Goodbye @{name}, we will miss you!';
export const STALK_MESSAGE = process.env.STALK_MESSAGE || 'Hello 👋, How is your day going ?';

// ─── Connection ────────────────────────────────────────────────────────────────
export const RECONNECT_INTERVAL = parseInt(process.env.RECONNECT_INTERVAL) || 5000;
export const KEEP_ALIVE_INTERVAL = parseInt(process.env.KEEP_ALIVE_INTERVAL) || 15000;
export const SESSION_RETRY_INTERVAL = parseInt(process.env.SESSION_RETRY_INTERVAL) || 10000;