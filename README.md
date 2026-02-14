Look who has come to deploy

<img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExazE4Y2swMjl0ZGR3d3hxbmp0cHFwMHF2dWtveWxkZ2c1MGd6cHYxOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PrVAwWYQl1JPG/giphy.gif" width="200" style="border: 2px solid #fff; border-radius: 14px; justify-conent: center; align-items: center;">


Anyway, make sure you fork


[![Fork](https://img.shields.io/github/forks/engineermarcus/lex-luthor?style=for-the-badge&color=black)](https://github.com/engineermarcus/lex-luthor/fork)

Your WhatsApp contacts have no idea what's about to hit them.


---

[![Session](https://img.shields.io/website?url=https%3A%2F%2Flexluthermd.onrender.com&style=for-the-badge&logo=render&label=GET+SESSION&color=black)](https://lexluthermd.onrender.com)

---

## WHAT IT DOES

Reads your statuses. Likes them too. Converts your terrible memes into stickers. Translates messages you were too proud to admit you didn't understand. Responds to commands while you sleep.

It doesn't need your supervision. That's the point.

---

## FEATURES

| Feature | Details |
|---|---|
| Status automation | Views and reacts automatically |
| Sticker conversion | Images, videos, GIFs — all fair game |
| Translation | `.swahili`, `.english`, `.french` — reply or type |
| Text to speech | `.tts` — reply or type |
| Group management | Coming soon |
| AI integration | Coming soon |
| Media downloads | Coming soon |

---

## SETUP — TERMUX

```sh
termux-setup-storage
apt update && apt upgrade -y
apt install git nodejs ffmpeg libwebp
git clone https://github.com/engineermarcus/lex-luthor && cd lex-luthor
cp example.settings.js settings.js && micro settings.js
npm install && npm run luthor
```

> `Ctrl+S` to save. `Ctrl+Q` to quit. You're welcome.

---

## SETUP — VPS

```sh
git clone https://github.com/engineermarcus/lex-luthor && cd lex-luthor
cp example.settings.js settings.js && nano settings.js
npm install && npm run luthor
```

Keep it alive with PM2:

```sh
npm install -g pm2 && pm2 start main.js --name luthor && pm2 save
```

---

## FORK

Top right. You know what to do.

---

*Neiman Tech — 2026. Lex Luthor MD was not built for amateurs.*

# LEX LUTHOR MD