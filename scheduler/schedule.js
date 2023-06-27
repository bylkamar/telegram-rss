import database from "../database/database.js";
import utils from "../utils/utils.js";
var firstLoop = true;
export default {
  startLoop: async function (bot) {
    // # Récupération de tous les liens
    let links = await database.getLinks();
    for (let link of links) {
      if (firstLoop) {
        await utils.getLink(link.link).then(async (sourceJson) => {
          const items = sourceJson.rss.channel.item;
          let indexAdded = 0;

          for (let item of items) {
            // # Pour éviter d'avoir des doublons et de spam l'API Telegram lors du premier loop j'enregistre tout les liens des sources dans la db
            // Peut être que dans le futur je trouverais une meilleur solution...
            if (item.link === undefined) continue;
            if (firstLoop) {
              let checkAlreadyExist = await database.getHistoryLink(item.link);
              if (checkAlreadyExist.length != 0) continue;
              await database.addHistoryLink(item.link);
              indexAdded++;
            }
          }
          if (indexAdded > 0)
            console.log(
              `[✔] Nombre d'URLS récemment ajoutées avec succès: ${indexAdded}`
                .green
            );
        });
      } else {
        utils.getLink(link.link).then(async (sourceJson) => {
          if (sourceJson === undefined) return;
          const items = sourceJson.rss.channel.item;
          let indexAdded = 0;
          for (let item of items) {
            if (item.link === undefined) continue;
            let checkAlreadyExist = await database.getHistoryLink(item.link);
            if (checkAlreadyExist.length != 0) continue;
            await database.addHistoryLink(item.link);
            indexAdded++;
            // # Le lien n'est pas dans notre DB et a donc été poster récemment
            let users = await database.getUsers();
            for (let user of users) {
              // # Certaines balises HTML ne sont pas accepter
              bot.sendMessage(
                user.userId,
                `<b><u><a href="${item.link}">${
                  item.title
                }</a></u></b>\n\n<b><em>${item.description.replace(
                  /(<([^>]+)>)/gi,
                  ""
                )}</em></b>`,
                { parse_mode: "HTML" }
              );
            }
          }
          if (indexAdded > 0)
            console.log(
              `[✔] Nombre d'URLS récemment ajoutées avec succès: ${indexAdded}`
                .green
            );
        });
      }
    }
    firstLoop = false;
  },
};
