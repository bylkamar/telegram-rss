import mysql from "mysql2"
import config from "../config.json" assert {type: "json"}

const connection = mysql.createConnection(config.database);

export default {
    // Default table
    initTables: async function () {
        // #HISTORY - Permet de vérifier l'historique et ne pas envoyer de duplicata
        connection.promise().execute("CREATE TABLE IF NOT EXISTS history  (id INT NOT NULL AUTO_INCREMENT, link VARCHAR(250) NOT NULL, PRIMARY KEY (id)) ENGINE = MyISAM;").catch(err => {
            console.log(`[X] Une erreur est survenue lors du setup (table history): ${err}`.red)
        })

        // #RSS - Enregistre les liens pour obtenir les données des liens.
        connection.promise().execute("CREATE TABLE IF NOT EXISTS rss (id INT NOT NULL AUTO_INCREMENT, link VARCHAR(250) NOT NULL, PRIMARY KEY (id), UNIQUE (link)) ENGINE = MyISAM; ").catch(err => {
            console.log(`[X] Une erreur est survenue lors du setup (table RSS): ${err}`.red)
        })

        // #USERS - Enregistre les utilisateurs pour pouvoir les notifiers.
        connection.promise().execute("CREATE TABLE IF NOT EXISTS users (id INT NOT NULL AUTO_INCREMENT, userId BIGINT NOT NULL, PRIMARY KEY (id), UNIQUE (userId)) ENGINE = MyISAM; ").catch(err => {
            console.log(`[X] Une erreur est survenue lors du setup (table USERS): ${err}`.red)
        })
    },
    getUser: async function (userId) {
        let users = undefined
        await connection.promise().execute("SELECT * FROM users WHERE userId = ?", [userId]).then(async res => {
            users = res[0]
        }).catch(err => {
            console.log(`[X] Une erreur est survenue db (getUser): ${err}`.red)
        })
        return users
    },
    deleteUser: async function (userId) {
        let error = undefined
        await connection.promise().execute("DELETE FROM users WHERE userId = ?", [userId]).catch(err => {
            error = err
            console.log(`[X] Une erreur est survenue pour supprimer l'utilisateur (${userId}): ${err}`.red)
        })
        return error
    },
    addUser: async function (userId) {
        let error = undefined
        await connection.promise().execute("INSERT INTO users (userId) VALUE (?)", [userId]).catch(err => {
            error = err
            console.log(`[X] Une erreur est survenue lors de l'ajout d'une utilisateur (${userId}): ${err}`.red)
        })
        return error
    },
    getUsers: async function () {
        let users = undefined
        await connection.promise().execute("SELECT * FROM users").then(async res => {
            users = res[0]
        }).catch(err => {
            console.log(`[X] Une erreur est survenue db (getUsers): ${err}`.red)
        })
        return users
    },
    addHistoryLink: async function (link) {
        let error = undefined
        await connection.promise().execute("INSERT INTO history (link) VALUE (?)", [link]).catch(err => {
            error = err
            console.log(`[X] Une erreur est survenue lors de l'ajout d'une lien (addHistoryLink): ${err}`.red)
        })
        return error
    },
    getHistoryLink: async function (linkQuery) {
        let link = undefined
        await connection.promise().execute("SELECT * FROM history WHERE link = ?", [linkQuery]).then(async res => {
            link = res[0]
        }).catch(err => {
            console.log(`[X] Une erreur est survenue db (getLinks): ${err}`.red)
        })
        return link
    },
    getLinks: async function () {
        let links = undefined
        await connection.promise().execute("SELECT link FROM rss").then(async res => {
            links = res[0]
        }).catch(err => {
            console.log(`[X] Une erreur est survenue db (getLinks): ${err}`.red)
        })
        return links
    },
    addLinkRSS: async function (link) {
        let error = undefined
        await connection.promise().execute("INSERT INTO rss (link) VALUE (?)", [link]).catch(err => {
            error = err
            console.log(`[X] Une erreur est survenue lors de l'ajout d'une source (table RSS): ${err}`.red)
        })
        return error
    }
}