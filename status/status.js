import { AUTO_VIEW_STATUS, AUTO_LIKE_STATUS } from '../settings.js';

const REACTIONS = [
    '🔥', '😍', '🥶', '💯', '👏', '😂', '🤩', '💀', '👀', '🫡',
    '🤣', '😎', '🥵', '😱', '🤯', '💥', '🎯', '👑', '🏆', '⚡',
    '🌊', '🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎸', '🎺', '🥁',
    '🚀', '🛸', '🌍', '🌙', '⭐', '🌟', '💫', '✨', '🌈', '☄️',
    '💎', '💰', '👾', '🤖', '👻', '🦁', '🐯', '🦊', '🐺', '🦅',
    '🦋', '🐉', '🦄', '🦈', '🐬', '🌺', '🌸', '🍀', '🌴', '🌵',
    '🍕', '🍔', '🌮', '🍜', '🍣', '🍦', '🎂', '🍭', '🧃', '☕',
    '🏀', '⚽', '🏈', '🎾', '🏋️', '🤸', '🏄', '🧗', '🏇', '🥊',
    '😤', '🤑', '😜', '🤪', '😈', '🤬', '😤', '🥸', '🫠','🫶', 
    '🤙', '👊', '✊', '🤞', '🫰', '🤟', '🤘', '👋', '🙌'
];

export async function autoViewAndLikeStatus(sock, msg) {
    if (!msg || !msg.key) return;

    try {
        const senderJid = msg.key.remoteJidAlt || msg.key.participant;
        const senderName = msg.pushName || msg.verifiedBizName || 'Unknown';

        if (AUTO_VIEW_STATUS) {
            await sock.readMessages([msg.key]);
            console.log(`👁️ Viewed status from: ${senderName} (${senderJid?.split('@')[0]})`);
        }

        if (AUTO_LIKE_STATUS) {
            if (!senderJid) return;
            setTimeout(async () => {
                try {
                    const emoji = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
                    await sock.sendMessage(senderJid, {
                        react: { text: emoji, key: msg.key }
                    });
                    console.log(`${emoji} Liked status from: ${senderName}`);
                } catch (err) {
                    console.error('Like error:', err.message);
                }
            }, 300);
        }
    } catch (error) {
        console.error('Status error:', error.message);
    }
}