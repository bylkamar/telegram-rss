<h1 align="center">Telegram-RSS</h1>

<div align="center">
 
Bot Telegram qui permet d'être notifié des flux RSS.

[![Stars](https://img.shields.io/github/stars/bylkamar/telegram-rss?style=social)](https://github.com/bylkamar/telegram-rss)
[![Forks](https://img.shields.io/github/forks/bylkamar/telegram-rss?style=social
)](https://github.com/bylkamar/telegram-rss)
[![Issues](https://img.shields.io/github/issues/bylkamar/telegram-rss
)](https://github.com/bylkamar/telegram-rss)



</div>

> ✍️ **Note:** Ce projet n'est pas encore terminé
>

## 📦 Installation

> 💖 Pour le bon fonctionnement du bot il est nécessaire d'avoir une database SQL

* Installer les dépendences requises
```sh
npm i 
```
* Configurer le fichier JSON
```json
{
    "adminId": "Votre ID Telegram",
    "token": "API Key Telegram Bot",
    "timeLoop": 5, // <--- nombre de secondes d'intervalle de rafraichissement des sources
    "database": {
        "host": "localhost",
        "user": "root",
        "password": "",
        "database": "rss"
    }
}
```
* Lancer le bot
```sh
node index.js 
```

<br/>

## 🚀 Utilisation

> Une fois le bot lancer il vous suffit d'éffectuer la commande ```/start``` <br>
> <img src="https://i.imgur.com/V4KjkE4.png" />

> ➕ Ajouter une ou plusieurs sources RSS

> 🎉 Le setup est terminé les utilisateurs abonnées aux RSS recevront une notification lors d'une mise à jour
## 📚 To Do List

* Finir le bot
* Optimiser le code et le réfactoriser
* Notification en temps réel ?
* Possibilité de modifier le message de notification par source

> Je suis ouvert <a href="https://github.com/bylkamar/telegram-rss/pulls">aux idées</a> ou bien si vous avez reperéz <a href="https://github.com/bylkamar/telegram-rss/issues">des bugs</a>, soumettez-les moi.



## 👥 Contributeurs

<p align="center">
  <a href="https://github.com/bylkamar/telegram-rss/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=bylkamar/telegram-rss" />
  </a>
</p>

## License

**The MIT License (MIT)**
