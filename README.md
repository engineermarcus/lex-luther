Look who has come to deploy
<p align="center">
  <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExazE4Y2swMjl0ZGR3d3hxbmp0cHFwMHF2dWtveWxkZ2c1MGd6cHYxOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PrVAwWYQl1JPG/giphy.gif" width="40%" />
</p>

Anyway, make sure you fork and star please


[![Fork](https://img.shields.io/github/forks/engineermarcus/lex-luthor?style=for-the-badge&color=black)](https://github.com/engineermarcus/lex-luthor/fork)

Your WhatsApp contacts have no idea what's about to hit them.


---

[![Session](https://img.shields.io/website?url=https%3A%2F%2Flexluthermd.onrender.com&style=for-the-badge&logo=render&label=GET+SESSION&color=black)](https://lexluthermd.onrender.com)

---

## WHAT IT DOES

Reads your statuses. Likes them too. Converts your terrible memes into stickers. Translates messages you were too proud to admit you didn't understand. Responds to commands while you sleep.

It doesn't need your supervision. That's the point.

---

## KEY FEATURES

| Feature | Details |
|---|---|
| Status automation | Views and reacts automatically |
| Sticker conversion | Images, videos, GIFs — all fair game |
| Translation | .swahili, .english, .french — reply or type |
| Text to speech | .tts — reply or type |
| Group management | Kick, mute, antilink, welcome/goodbye |
| Fun commands | memes, jokes, 8ball, insults and more |
| Anti-delete | Catches deleted messages and exposes them |
| Media downloads | Coming soon |
| AI integration | Coming soon |

---

## DEPLOY ON TERMUX

- install termux from playstore, fdroid or whatever...
```sh
# give storage permissions
termux-setup-storage
# update system packages 
apt update && apt upgrade -y
# install esentials 
apt install git nodejs ffmpeg libwebp python3 micro vim
# clone the repository 
git clone https://github.com/engineermarcus/lexluthor && cd lexluthor
# Open settings and paste your session ID 
micro settings.js
# install final dependencies 
npm install 
# run the bot 
npm run luthor
```

> `Ctrl+S` to save. `Ctrl+Q` to quit. You're welcome.

---

## DEPLOY VPS, CODESPACES OR ON YOUR LOCAL MACHINE 
```sh
# clone the repo
git clone https://github.com/engineermarcus/lexluthor && cd lexluthor
# Open vscode or nano
nano settings.js
# install dependencies 
npm install 
# run the app
npm run luthor
```

Keep it alive with PM2:
```sh
npm install -g pm2 && pm2 start main.js --name luthor && pm2 save
```

---

## DEPLOY WITH DOCKER (MOST EFFECTIVE)
```sh
# clone the reposotories 
git clone https://github.com/engineermarcus/lexluthor && cd lexluthor
# nano banana or just any IDE you get 
nano settings.js
# build the docker image 
docker build -t lexluthor .
# run it
docker run -d --name luthor lexluthor
```

---

## DEPLOY RENDER (MOST SUITABLE FOR PRODUCTION)

1. Fork the repo
2. Go to [render.com](https://render.com) and create a new **Web Service**
3. Connect your forked repo
4. Set the following:

| Field | Value |
|---|---|
| Environment | Docker |


5. Add environment variables:

| Key | Value |
|---|---|
| `SESSION_ID` | Your session ID from the session manager |
| `OWNER_NUMBER` | Your WhatsApp number without `+` |

6. Click **Deploy** — done.

> Get your session ID first from the session manager above before deploying.

---

## FORK

Top right. You know what to do.

---

*Neiman Tech — 2026. Lex Luthor MD was not built for amateurs.*

# LEX LUTHOR MD