// discover.js
// Anpassung an die tatsächliche Struktur von animebase.to

const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Ruft die Hauptseite ab und extrahiert die Liste der verfügbaren Animes.
 * Äquivalent zu "extractDetails" für die Hauptliste.
 * @param {string} url - Die URL der Seite (Startseite oder Listenansicht).
 * @returns {Promise<Array>} - Liste der Animes mit Titel, Thumbnail und Link.
 */
async function extractDetails(url = 'https://animebase.to/anime/liste') {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const html = response.data;
        const $ = cheerio.load(html);
        const animeList = [];

        // WÄHLE DEN SELEKTOR, DER DIE ANIME-ELEMENTE AUF DER LISTENSEITE UMSCHLIESST.
        // Beispiel: `.anime-card`, `article`, `tr`, etc.
        $('YOUR_ANIME_ITEM_SELECTOR').each((index, element) => {
            const titleElement = $(element).find('YOUR_TITLE_SELECTOR');
            const imageElement = $(element).find('YOUR_IMAGE_SELECTOR');
            const linkElement = $(element).find('YOUR_LINK_SELECTOR');

            const title = titleElement.text().trim() || 'Unbekannter Titel';
            // Thumbnail-URL extrahieren (oft im 'src' oder 'data-src' Attribut)
            const thumbnail = imageElement.attr('src') || imageElement.attr('data-src') || '';
            // Den relativen oder absoluten Link zur Anime-Detailseite extrahieren
            const detailLink = linkElement.attr('href');

            // Stelle sicher, dass der Link absolut ist
            const fullDetailLink = detailLink ? new URL(detailLink, 'https://animebase.to').href : null;

            if (fullDetailLink) {
                animeList.push({
                    title: title,
                    thumbnail: thumbnail,
                    link: fullDetailLink,
                    // Optional: Typ oder Jahrgang extrahieren
                    // type: $(element).find('.type').text()
                });
            }
        });

        console.log(`[AnimeBase] Gefundene Animes auf der Seite: ${animeList.length}`);
        return animeList;

    } catch (error) {
        console.error('[AnimeBase] Fehler beim Scrapen der Übersicht:', error.message);
        return [];
    }
}

/**
 * Sora ruft diese Funktion auf, um die Detailansicht zu laden.
 * Hier könnte man zusätzliche Infos wie Beschreibung oder Genre holen.
 * @param {string} url - Die URL der Detailseite.
 */
async function extractDetails(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(response.data);

        return {
            title: $('h1.anime-title').text().trim(),
            description: $('.anime-description').text().trim(),
            thumbnail: $('.anime-poster img').attr('src'),
            // Weitere Details...
        };
    } catch (error) {
        console.error('[AnimeBase] Fehler bei Details:', error.message);
        return null;
    }
}

module.exports = { extractDetails };
