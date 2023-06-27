import colors from "colors";
import telegrambot from "node-telegram-bot-api";
import config from "./config.json" assert { type: "json" };
import database from "./database/database.js";
import schedule from "./scheduler/schedule.js";
import utils from "./utils/utils.js";

const bot = new telegrambot(config.token, { polling: true });
bot.getMe().then((r) => {
  console.log(`[✔] @${r.username}`.green);
});
database.initTables();

setInterval(() => {
  schedule.startLoop(bot);
}, config.timeLoop * 1000);

bot.onText(/\/start/, (msg) => {
  if (msg.chat.type != "private") return;
  const chatId = msg.chat.id;
  let Buttons = [];
  if (utils.checkAdmin(msg.chat.id))
    Buttons.push([
      {
        text: "➕ Ajouter Source",
        callback_data: JSON.stringify({
          action: "addLink",
        }),
      },
      {
        text: "➖ Supprimer Source",
        callback_data: JSON.stringify({
          action: "deleteLink",
        }),
      },
    ]);
  Buttons.push([
    {
      text: "🧐 S'abonner aux RSS",
      callback_data: JSON.stringify({
        action: "subscribe",
      }),
    },
  ]);
  // Envoie du menu de base
  bot.sendMessage(
    chatId,
    "<b>🎉 Bienvenue !\n\n👉 Choisissez une option ci dessous</b>",
    {
      parse_mode: "HTML",
      reply_markup: JSON.stringify({
        inline_keyboard: Buttons,
      }),
    }
  );
});

bot.on("callback_query", async (cb) => {
  let Data = undefined;
  try {
    Data = JSON.parse(cb.data);
  } catch (err) {
    bot.sendMessage(cb.message.chat.id, "Impossible de répondre à ce boutton.");
    return;
  }

  if (Data.action === "addLink") {
    if (!utils.checkAdmin(cb.message.chat.id)) return;
    let rssQ = await bot.sendMessage(
      cb.message.chat.id,
      "<b>👉 Entrez le lien RSS de la source souhaité</b>",
      { parse_mode: "HTML" }
    );
    let rssA = await getMessage(bot, cb.message.chat.id, cb.message.chat.id);
    if (rssA === undefined) return;
    if ((await database.addLinkRSS(rssA.text)) != undefined)
      return bot.sendMessage(
        cb.message.chat.id,
        "<b>❌ Impossible d'ajouter le lien, regarder la console pour plus d'information</b>",
        { parse_mode: "HTML" }
      );
    else
      bot.sendMessage(
        cb.message.chat.id,
        "<b>✅ Lien ajouté avec succès !</b>",
        { parse_mode: "HTML" }
      );

    await utils.getLink(rssA.text).then(async (sourceJson) => {
      const items = sourceJson.rss.channel.item;
      let indexAdded = 0;

      for (let item of items) {
        // # Pour éviter d'avoir des doublons et de spam l'API Telegram lors du premier loop j'enregistre tout les liens des sources dans la db
        // Peut être que dans le futur je trouverais une meilleur solution...
        let checkAlreadyExist = await database.getHistoryLink(item.link);
        if (checkAlreadyExist.length != 0) continue;
        await database.addHistoryLink(item.link);
        indexAdded++;
      }

      if (indexAdded > 0)
        console.log(
          `[✔] Nombre d'URLS récemment ajoutées avec succès: ${indexAdded}`
            .green
        );
    });
  } else if (Data.action === "subscribe") {
    if ((await database.getUser(cb.message.chat.id)).length != 0)
      return (
        database.deleteUser(cb.message.chat.id) &&
        bot.sendMessage(
          cb.message.chat.id,
          "<b>❌ Vous n'êtes plus sur notre liste de notification!</b>",
          { parse_mode: "HTML" }
        )
      );
    await database.addUser(cb.message.chat.id);
    bot.sendMessage(
      cb.message.chat.id,
      "<b>✅ Vous êtes désormais abonné aux nouvelles notifications!</b>",
      { parse_mode: "HTML" }
    );
  } else if (Data.action === "deleteLink") {
    let rssQ = await bot.sendMessage(
      cb.message.chat.id,
      "<b>👉 Entrez le lien RSS de la source a supprimé</b>",
      { parse_mode: "HTML" }
    );
    let rssA = await getMessage(bot, cb.message.chat.id, cb.message.chat.id);
    if (rssA === undefined) return;

    if ((await database.deleteLink(rssA.text)) != undefined)
      return bot.sendMessage(
        cb.message.chat.id,
        "<b>❌ Impossible de supprimer le lien, regarder la console pour plus d'information</b>",
        { parse_mode: "HTML" }
      );
    else
      bot.sendMessage(
        cb.message.chat.id,
        "<b>✅ Lien supprimer avec succès !</b>",
        { parse_mode: "HTML" }
      );
  }
});

// Permet d'obtenir le message d'un utilisateur
async function getMessage(bot, userId, chatId) {
  let text = undefined;
  let received = false;
  while (received === false) {
    await new Promise((resolve, reject) => {
      setTimeout(async function () {
        if (received === false) {
          let msg = await bot.sendMessage(chatId, "Limite de temps écouler");
          setTimeout(async function () {
            bot.deleteMessage(chatId, msg.message_id);
          }, 3200);
          reject("Timed out");
        }
      }, 15000);
      bot.once("message", (msg) => {
        if (msg.from.id === userId) {
          received = true;
          text = msg;
        }
        resolve(true);
      });
    }).catch((err) => {
      console.log(err);
      return;
    });
    return text;
  }
}
