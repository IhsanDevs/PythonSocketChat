![Logo](/.github/PythonSocketChat.png)

# Python Socket Chat

Simple python chat app using Flask & Socket.IO

## Demo

Too see the demo, you can visit [here](/.github/Demo.mov)

## Features

- [ ] Light/dark mode toggle
- [x] Public chat
- [x] Persistant account
- [x] Delete account
- [x] Update account
- [x] Auto change author message when account Update
- [x] Notify status to all user (User updated, user is online, user if offline, deleted user account, joined new user)
- [x] Single Page Application (SPA)? **SURE!**
- [ ] Delete message(s)
- [ ] Create multi room
- [ ] Chat with personal account
- [ ] Send message with image(s)
- [ ] Send file
- [ ] Reply message
- [ ] Message link preview

## Requirements

1. Python. Recommended version is `3.8`. You can install multi python version using [pyenv](https://github.com/pyenv/pyenv).

## Installation

Install **Python Socket Chat** :

1. clone this repository

```bash
git clone https://github.com/IhsanDevs/PythonSocketChat

cd PythonSocketChat
```

2. Install all PIP dependencies

```bash
pip install -r requirements.txt
```

3. Finally, run the app!

```bash
python app.py
```

## Deployment

For now, i'm just testing it in my local computer. I have test to deploy and run in [Repl.it](https://replit.com/) and [pytonanywhere](https://www.pythonanywhere.com/) but this project doesn't work. Because they're doesn't support websocket server.

On [Heroku](https://www.heroku.com)? My mind that doesn't work too. because Heroku doesn't support persistant storage. This project use SQLite for manage data like chat histories and users data.

Maybe you can deploy this project with your own VPS server. Just run the project in background service using [PM2](https://pm2.keymetrics.io) and reverse the port using NGINX to your domain.

## Contributing

Contributions are always welcome!
