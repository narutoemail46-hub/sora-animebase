// search.js
const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Durchsucht die Website nach einem bestimmten Keyword.
 * @param {string} keyword - Der Suchbegriff.
 * @returns {Promise<Array>} - Liste der gefundenen Animes.
 */
async function searchResults(keyword) {
    if (!keyword) return [];

    // Die tatsächliche Such-URL von animebase.to ermitteln.
    // Oft ist es: /anime/liste?search=begriff oder /search?q=begriff
    const searchUrl = `https://animebase.to/anime/liste?search=${encodeURIComponent(keyword)}`;

    try {
        const response = await axios.get(searchUrl, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(response.data);
        const results = [];

        // WÄHLE DEN SELBEN SELEKTOR WIE IN DISCOVER.JS
        $('YOUR_ANIME_ITEM_SELECTOR').each((index, element) => {
            const titleElement = $(element).find('YOUR_TITLE_SELECTOR');
            const imageElement = $(element).find('YOUR_IMAGE_SELECTOR');
            const linkElement = $(element).find('YOUR_LINK_SELECTOR');

            const title = titleElement.text().trim();
            const thumbnail = imageElement.attr('src') || imageElement.attr('data-src');
            const detailLink = linkElement.attr('href');

            // Prüfen, ob der Titel das gesuchte Keyword enthält (optional, falls die Suche selbst schon filtert)
            if (title.toLowerCase().includes(keyword.toLowerCase())) {
                results.push({
                    title: title,
                    thumbnail: thumbnail || '',
                    link: detailLink ? new URL(detailLink, 'https://animebase.to').href : null,
                });
            }
        });

        return results.slice(0, 20); // Max. 20 Ergebnisse zurückgeben

    } catch (error) {
        console.error('[AnimeBase Search] Fehler:', error.message);
        return [];
    }
}

module.exports = { searchResults };
