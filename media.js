// media.js
const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Extrahiert die Liste der Episoden von der Anime-Detailseite.
 * @param {string} url - Die URL der Anime-Detailseite.
 * @returns {Promise<Array>} - Liste der Episoden mit Titel und Link.
 */
async function extractEpisodes(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(response.data);
        const episodes = [];

        // WÄHLE DEN EPISODEN-SELEKTOR (z.B. die Tabelle oder Liste der Episoden)
        $('YOUR_EPISODE_ROW_SELECTOR').each((index, element) => {
            const episodeLinkElement = $(element).find('YOUR_EPISODE_LINK_SELECTOR');
            const episodeNumberText = $(element).find('YOUR_EPISODE_NR_SELECTOR').text().trim();

            let episodeTitle = `Episode ${episodeNumberText || index + 1}`;
            // Versuche, Sprach-Tags zu erkennen (Ger Dub / Ger Sub)
            const episodeContext = $(element).text();
            if (episodeContext.includes('Ger Dub') || episodeContext.includes('DE Dub')) {
                episodeTitle += ' [Ger Dub]';
            } else if (episodeContext.includes('Ger Sub') || episodeContext.includes('DE Sub')) {
                episodeTitle += ' [Ger Sub]';
            }

            const episodeUrl = episodeLinkElement.attr('href');
            if (episodeUrl) {
                episodes.push({
                    title: episodeTitle,
                    url: new URL(episodeUrl, 'https://animebase.to').href,
                    number: index + 1
                });
            }
        });

        // Oft sind die Episoden absteigend sortiert (neueste zuerst). Wir sortieren sie aufsteigend.
        return episodes.reverse();

    } catch (error) {
        console.error('[AnimeBase] Fehler beim Extrahieren der Episoden:', error.message);
        return [];
    }
}

/**
 * Extrahiert die tatsächliche Video-Stream-URL von der Episodenseite.
 * Hier müssen die eingebetteten Hoster (Vidoza, Streamtape) ausgelesen werden.
 * @param {string} url - Die URL der Episodenseite.
 * @returns {Promise<string|null>} - Die direkte Video-URL oder null.
 */
async function extractStreamUrl(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(response.data);
        let videoUrl = null;

        // STRATEGIE 1: Direkter Video-Tag (selten, aber möglich)
        const directVideoSource = $('video source').attr('src');
        if (directVideoSource) {
            videoUrl = directVideoSource;
        }

        // STRATEGIE 2: Iframe von Videohostern (Vidoza, Streamtape, etc.)
        if (!videoUrl) {
            const iframeSrc = $('iframe').attr('src');
            if (iframeSrc && (iframeSrc.includes('vidoza') || iframeSrc.includes('streamtape') || iframeSrc.includes('doodstream'))) {
                // Hier müsste man nun die iframe-URL aufrufen, um an die finale Videodatei zu kommen.
                // Dies ist der komplexeste Teil, da viele Hoster Schutzmechanismen haben.
                console.log('[AnimeBase] Gefundener Hoster Iframe:', iframeSrc);
                // In einer echten Implementierung müsste man nun den Iframe-Inhalt parsen.
                // Rückgabe des Iframe-Links als Platzhalter, da Sora evtl. selbst damit umgehen kann?
                // Oft will Sora aber die .mp4 oder .m3u8 URL.
                videoUrl = iframeSrc; // Platzhalter
            }
        }

        // STRATEGIE 3: JavaScript-Variablen oder Datenattribute im HTML
        if (!videoUrl) {
            // Suche nach einem Muster wie: data-video="https://..."
            $('[data-video]').each((i, el) => {
                videoUrl = $(el).attr('data-video');
                return false; // Schleife abbrechen
            });
        }

        return videoUrl;

    } catch (error) {
        console.error('[AnimeBase] Fehler beim Extrahieren des Streams:', error.message);
        return null;
    }
}

module.exports = { extractEpisodes, extractStreamUrl };
