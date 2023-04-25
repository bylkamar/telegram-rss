import axios from "axios"
import xmlParser from 'xml2json'

export default {
    // # Requête HTTP pour récupérer les données XML et les convertir automatiquement en json
    getLink: async function (url) {
        let sourceJson = undefined
        await axios.get(url).then(async res => {
            sourceJson = xmlParser.toJson(res.data, { object: true });
        }).catch(err => {
            console.log(`[X] Impossible d'obtenir la source pour ${url} (${err})`.red)
        })
        return sourceJson
    }
}
