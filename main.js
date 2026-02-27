import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';
import {
     SESSION_ID, BOT_NAME, BOT_VERSION, PREFIX,OWNER_ONLY,
    OWNER_NUMBER, OWNER_NAME, AUTO_READ, AUTO_PRESENCE, RECONNECT_INTERVAL, KEEP_ALIVE_INTERVAL, SESSION_RETRY_INTERVAL
} from './settings.js';
import { autoViewAndLikeStatus } from './status/status.js';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import express from 'express';
import NodeCache from 'node-cache';
import { handleUtility } from './commands/utility.js';
import { sendMenu } from './commands/menu.js';
import { handleFunCommand } from './commands/fun.js';
import { handleGroupCommand, 
    handleGroupParticipantsUpdate, 
    handleAntiLink, 
    enforceMute, 
    handleAntiDelete,
    cacheMessage } from './commands/group.js';
import { registerAntiDelete } from './commands/group.js';
import { playCommand, audioCommand, videoCommand, searchInstagram } from './commands/media.js';
import youtubeApi from './routes/app.js'; 

const api = express();
const API_PORT = process.env.PORT || process.env.API_PORT || 3001;
const SESSION_MANAGER_URL = 'https://lexluthor-session.onrender.com';
api.set('trust proxy', true);
api.use(express.json());
api.use('/media', express.static('downloads'));
api.use('/',youtubeApi);

// Group metadata cache for Baileys v7
const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

// Health monitoring
let lastActivity = Date.now();
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

function updateActivity() {
    lastActivity = Date.now();
    reconnectAttempts = 0;
}

function startHealthMonitor() {
    setInterval(() => {
        const inactiveTime = Date.now() - lastActivity;
        
        // If inactive for more than 5 minutes, force reconnect
        if (inactiveTime > 5 * 60 * 1000) {
            console.log('⚠️ Bot inactive for too long, forcing reconnect...');
            if (sock && sock.ws) {
                sock.ws.close();
            }
        }

        // Send keepalive ping
        if (sock && sock.user) {
            sock.sendPresenceUpdate('available').catch(() => {});
        }
    }, 30000); // Check every 30 seconds
}

api.get('/status', (req, res) => {
    res.json({
        bot: BOT_NAME,
        version: BOT_VERSION,
        status: sock?.user ? 'connected' : 'disconnected',
        number: sock?.user?.id?.split(':')[0] || null,
        uptime: process.uptime(),
        lastActivity: new Date(lastActivity).toISOString()
    });
});

api.get('/ping', (req, res) => {
    updateActivity();
    res.json({ 
        status: 'alive', 
        uptime: process.uptime(),
        lastActivity: new Date(lastActivity).toISOString(),
        connected: sock?.user ? true : false
    });
});

api.post('/send', async (req, res) => {
    try {
        const { jid, message } = req.body;
        if (!jid || !message) return res.status(400).json({ error: 'jid and message required' });
        await sock.sendMessage(jid, { text: message });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

api.post('/restart', async (req, res) => {
    res.json({ success: true, message: 'Restarting...' });
    if (fs.existsSync(AUTH_DIR)) fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    isFirstConnect = true;
    setTimeout(() => startBot(), 2000);
});

const logger = pino({ level: 'silent' });
const AUTH_DIR = `./bot_session/${SESSION_ID}`;

async function fetchSessionFromManager() {
    try {
        console.log(`🔄 Fetching session [${SESSION_ID}] from manager...`);
        const { data } = await axios.get(`${SESSION_MANAGER_URL}/api/session/${SESSION_ID}/auth`);
        return data.files;
    } catch (error) {
        console.error('❌ Could not fetch session from manager:', error.message);
        return null;
    }
}

function saveSessionLocally(files) {
    try {
        if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
        for (const [filename, content] of Object.entries(files)) {
            fs.writeFileSync(path.join(AUTH_DIR, filename), content, 'utf-8');
        }
        console.log('💾 Session saved locally');
    } catch (error) {
        console.error('❌ Could not save session locally:', error.message);
    }
}

function hasLocalSession() {
    return fs.existsSync(path.join(AUTH_DIR, 'creds.json'));
}

async function getAuthState() {
    if (hasLocalSession()) {
        console.log('📂 Using local session');
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
        return { state, saveCreds };
    }

    let files = await fetchSessionFromManager();
    while (!files) {
        console.log(`⏳ Retrying manager in ${SESSION_RETRY_INTERVAL / 1000}s...`);
        await new Promise(r => setTimeout(r, SESSION_RETRY_INTERVAL));
        files = await fetchSessionFromManager();
    }

    saveSessionLocally(files);
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    return { state, saveCreds };
}

let sock;
let isFirstConnect = true;

async function startBot() {
    const { state, saveCreds } = await getAuthState();
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        logger,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        browser: Browsers.macOS('Chrome'),
        printQRInTerminal: false,
        markOnlineOnConnect: true,
        getMessage: async () => ({ conversation: '' }),
        syncFullHistory: false,
        retryRequestDelayMs: 2000,
        maxMsgRetryCount: 5,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: KEEP_ALIVE_INTERVAL,
        cachedGroupMetadata: async (jid) => groupCache.get(jid),
    });


    registerAntiDelete(sock);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('⚠️ QR Code generated - session might be invalid');
        }

        if (connection === 'connecting') {
            console.log('🔄 Connecting to WhatsApp...');
        }

        if (connection === 'open') {
            console.log(`✅ ${BOT_NAME} v${BOT_VERSION} connected!`);
            updateActivity();
            reconnectAttempts = 0;

            if (isFirstConnect) {
                isFirstConnect = false;
                startHealthMonitor();
                await sock.sendMessage(`${OWNER_NUMBER}@s.whatsapp.net`, {
                    text: `🟢 *${BOT_NAME} v${BOT_VERSION} is connected*\n\n_Uptime: ${Math.floor(process.uptime())}s_`
                });
            }
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = lastDisconnect?.error?.message || 'Unknown';
            console.log(`🔌 Disconnected — reason: ${reason} (code: ${statusCode})`);

            let shouldReconnect = true;
            let delay = RECONNECT_INTERVAL;

            if (statusCode === DisconnectReason.loggedOut) {
                console.log('🚪 Logged out — clearing local session...');
                if (fs.existsSync(AUTH_DIR)) fs.rmSync(AUTH_DIR, { recursive: true, force: true });
                isFirstConnect = true;
                shouldReconnect = true;
            } else if (statusCode === DisconnectReason.restartRequired) {
                console.log('🔄 Restart required');
                delay = 3000;
            } else if (statusCode === DisconnectReason.timedOut) {
                console.log('⏱️ Connection timed out');
                delay = 5000;
            } else if (statusCode === DisconnectReason.badSession) {
                console.log('❌ Bad session, clearing...');
                if (fs.existsSync(AUTH_DIR)) fs.rmSync(AUTH_DIR, { recursive: true, force: true });
                isFirstConnect = true;
            } else if (statusCode === DisconnectReason.connectionClosed) {
                console.log('🔌 Connection closed');
            } else if (statusCode === DisconnectReason.connectionLost) {
                console.log('📡 Connection lost');
            }

            if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                console.log(`🔄 Reconnecting in ${delay / 1000}s... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
                setTimeout(() => startBot(), delay);
            } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                console.log('❌ Max reconnection attempts reached. Waiting 5 minutes before retry...');
                setTimeout(() => {
                    reconnectAttempts = 0;
                    startBot();
                }, 5 * 60 * 1000);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Cache group metadata when groups are updated
    sock.ev.on('groups.update', async (updates) => {
        for (const update of updates) {
            try {
                const metadata = await sock.groupMetadata(update.id);
                groupCache.set(update.id, metadata);
            } catch (err) {
                console.error('❌ groups.update cache error:', err.message);
            }
        }
    });

    // Handle group participants (welcome/goodbye)
    sock.ev.on('group-participants.update', async (update) => {
        console.log('🔔 group-participants.update EVENT FIRED:', JSON.stringify(update));
        try {
            const metadata = await sock.groupMetadata(update.id);
            groupCache.set(update.id, metadata);
            await handleGroupParticipantsUpdate(sock, update);
        } catch (err) {
            console.error('❌ group-participants.update error:', err.message);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        updateActivity();

        for (const msg of messages) {
            const msgStart = Date.now(); // Timing starts here
            
            if (!msg.message) continue;

            const from = msg.key.remoteJid;

            // ── Status ─────────────────────────────────────────────────────
            if (from === 'status@broadcast') {
                await autoViewAndLikeStatus(sock, msg);
                continue;
            }

            const isGroup = from.endsWith('@g.us');
            const isChannel = from.endsWith('@newsletter');
            const realJid = msg.key.remoteJidAlt || msg.key.remoteJid;

            const senderNumber = isGroup
                ? msg.key.participant?.split('@')[0].split(':')[0]
                : realJid.split('@')[0].split(':')[0];

            const isOwner = msg.key.fromMe || senderNumber === OWNER_NUMBER;
            const senderName = msg.pushName || 'Unknown';

            const body =
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.message?.imageMessage?.caption ||
                msg.message?.videoMessage?.caption || '';

            // Skip non-commands early to avoid unnecessary processing
            if (!body.startsWith(PREFIX)) {
                // Still cache and handle anti-delete for all messages
                cacheMessage(msg);
                await handleAntiDelete(sock, msg);
                
                // Only log and process mute/antilink for groups
                if (isGroup) {
                    await enforceMute(sock, msg);
                    await handleAntiLink(sock, msg);
                }
                continue;
            }

            // Now we know it's a command - do full processing
            cacheMessage(msg);
            await handleAntiDelete(sock, msg);
            
            console.log(`─────────────────────────────────`);
            console.log(`📨 From    : ${isGroup ? 'Group' : isChannel ? 'Channel' : 'DM'}`);
            console.log(`👤 Name    : ${senderName}`);
            console.log(`📞 Number  : ${senderNumber}`);
            console.log(`💬 Message : ${body || '[media/no text]'}`);
            console.log(`🆔 JID     : ${from}`);
            console.log(`👑 Owner   : ${isOwner}`);

            if (AUTO_READ) await sock.readMessages([msg.key]);
            if ((OWNER_ONLY === true || OWNER_ONLY === 'true') && !isOwner) {
    console.log(`🚫 Blocked: ${senderNumber} tried to use ${body}`);
    continue;
}
            // ── Enforce mute & antilink on commands in groups ──────────────
            if (isGroup) {
                await enforceMute(sock, msg);
                
                const linkBlocked = await handleAntiLink(sock, msg);
                if (linkBlocked) {
                    console.log(`🔗 Message blocked by antilink (${Date.now() - msgStart}ms)`);
                    continue;
                }
            }

            // ── Show presence before responding to commands ────────────────
            if (AUTO_PRESENCE && AUTO_PRESENCE !== 'none') {
                const presenceMap = {
                    'typing': 'composing',
                    'recording': 'recording',
                    'online': 'available'
                };
                const presence = presenceMap[AUTO_PRESENCE] || 'composing';
                sock.sendPresenceUpdate(presence, from).catch(() => {}); // Don't await
            }

            const args = body.slice(PREFIX.length).trim().split(/\s+/);
            const command = args.shift().toLowerCase();

            const cmdStart = Date.now();

            switch (command) {
                case 'ping':
                    await sock.sendMessage(from, { text: '🏓 Pong!' }, { quoted: msg });
                    break;
                // Media commands
                case 'play':
                    await playCommand(sock, msg, args);
               break;
               case 'audio':
                   await audioCommand(sock, msg, args);
               break;
               
               case 'video':
               case 'mp4':
                   await videoCommand(sock, msg, args);
               break;
               //social media
               case 'ig':
                await searchInstagram(sock, msg, args);
               break;
               case 'alive':
                    await sock.sendMessage(from, {
                        text: `✅ *${BOT_NAME} v${BOT_VERSION}*\n\n> Running 24/7\n> Prefix: ${PREFIX}\n> Owner: ${OWNER_NAME}\n> Phone: ${OWNER_NUMBER}\n> Uptime: ${Math.floor(process.uptime())}s`
                    }, { quoted: msg });
                    break;
                case 'owner':
                    await sock.sendMessage(from, {
                        text: `\n\n> Owner: ${OWNER_NAME}\n> Phone: ${OWNER_NUMBER}\n> Uptime: ${Math.floor(process.uptime())}s`
                    }, { quoted: msg });
                    break;
                case 'menu':
                case 'help':
                    await sendMenu(sock, from, msg);
                    break;

                default: {
                    const handlers = [
                        () => handleFunCommand(sock, msg, command, args),
                        () => handleGroupCommand(sock, msg, command, args),
                        () => handleUtility(sock, msg, from, command, args),
                    ];
                    for (const handler of handlers) {
                        const handled = await handler();
                        if (handled) break;
                    }
                    break;
                }
            }

            const totalTime = Date.now() - msgStart;
            const cmdTime = Date.now() - cmdStart;
            console.log(`⏱️ Total: ${totalTime}ms | Command: ${cmdTime}ms`);
            console.log(`─────────────────────────────────`);
        }
    });
}

process.on('uncaughtException', (err) => console.error('💥 Uncaught Exception:', err.message));
process.on('unhandledRejection', (err) => console.error('💥 Unhandled Rejection:', err?.message || err));

console.log(`🚀 Starting ${BOT_NAME} v${BOT_VERSION}...`);
export { sock };
api.listen(API_PORT, () => {
    console.log(`🌐 Bot API running on port ${API_PORT}`);
    startBot();
});
