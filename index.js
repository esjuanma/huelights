require('dotenv').config();
const inquirer = require('inquirer');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const ip = process.env.HUE_IP;
const user = process.env.HUE_USER;

bot.onText(/^\/lightson/, async (msg) => {
    for (let light = 1; light <= 3; light++) {
        fetch(`http://${ip}/api/${user}/lights/${light}/state`, {
            method: 'PUT',
            body: JSON.stringify({ on: true })
        });
    }
});

bot.onText(/^\/lightsoff/, async (msg) => {
    for (let light = 1; light <= 3; light++) {
        fetch(`http://${ip}/api/${user}/lights/${light}/state`, {
            method: 'PUT',
            body: JSON.stringify({ on: false })
        });
    }
});

bot.on('message', async (msg) => {});