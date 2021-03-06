#!/usr/bin/env node
//Set up the configuration files
process.env["NODE_CONFIG_DIR"] = "../config/";

const Eris = require('eris');
const config = require('config');
const i18n = require('i18n');
const log = require('log');
const handler = require('handler');
const modloader = require("./modloader");
const db = require("db");
const prefix = require("prefix");

const t = i18n.t;
process.exitCode = 1; //Assume error unless otherwise proven

(async () => {
    log(t("Welcome to {{BOT_NAME}}!", {"BOT_NAME": config.get("bot.name")}));
    
    if (!await db.init()) return; //Die if something happens when initialising the database
    modloader.init();
    handler.init();
    
    let bot = new Eris(config.get('discord.token'));
    bot.on("ready", () => {
        log(t("Locked and loaded!"), log.success);
    });
    bot.on("messageCreate", async (msg) => {
        if (msg.author.bot) return;
        
        let pf = await prefix(msg.channel.guild);
        if (msg.content.startsWith(pf) || pf === "") {
            handler.process(pf, msg);
        }
    });

    process.on("SIGINT", () => {
        console.log(); // Make text appear on line after ^C
        log(t("Shutting down {{BOT_NAME}}..."), {"BOT_NAME": config.get("bot.name")});
        bot.disconnect({reconnect: false});
        log(t("See you next time!"), log.success);
        process.exit(0);
    });

    bot.connect();
    
    handler.setBot(bot);
})();
