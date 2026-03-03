// service.js für Anime-Base.net - Mit korrekten Selektoren!
const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const BASE_URL = 'https://anime-base.net';

function toAbsoluteUrl(relativeUrl) {
    if (!relativeUrl) return null;
    try {
        return new URL(relativeUrl, BASE_URL).href;
    } catch (e) {
        return null;
    }
}

// === ENTDECKEN (Anime-Liste) ===
async function extractDetails(url = 'https://anime-base.net/anime-liste') {
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);
        const animeList = [];

        // Jeden Anime-Container durchgehen
        $('.anime-item, .series-item').each((index, element) => {
            // Titel auslesen - oft in h3 oder a-Tags
            const titleElement = $(element).find('h3 a, .title a, a[href^="/anime/"]');
            const title = titleElement.text().trim();
            
            // Bild auslesen
            const imageElement = $(element).find('img');
            const thumbnail = imageElement.attr('src') || imageElement.attr('data-src');
            
            // Link auslesen
            const linkElement = $(element).find('a[href^="/anime/"]').first();
            const link = linkElement.attr('href');

            if (title && link) {
                animeList.push({
                    title: title,
                    thumbnail: thumbnail ? toAbsoluteUrl(thumbnail) : '',
                    link: toAbsoluteUrl(link)
                });
            }
        });

        console.log(`[AnimeBase] Gefundene Animes: ${animeList.length}`);
        return animeList;
    } catch (error) {
        console.error('Fehler in extractDetails:', error.message);
        return [];
    }
}

// === SUCHE ===
async function searchResults(keyword) {
    if (!keyword) return [];
    const searchUrl = `https://anime-base.net/anime-liste?title=${encodeURIComponent(keyword)}`;
    
    try {
        const response = await axios.get(searchUrl, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);
        const results = [];

        $('.anime-item, .series-item').each((index, element) => {
            const titleElement = $(element).find('h3 a, .title a, a[href^="/anime/"]');
            const title = titleElement.text().trim();
            const imageElement = $(element).find('img');
            const thumbnail = imageElement.attr('src') || imageElement.attr('data-src');
            const linkElement = $(element).find('a[href^="/anime/"]').first();
            const link = linkElement.attr('href');

            if (title && link) {
                results.push({
                    title: title,
                    thumbnail: thumbnail ? toAbsoluteUrl(thumbnail) : '',
                    link: toAbsoluteUrl(link)
                });
            }
        });

        return results.slice(0, 20);
    } catch (error) {
        console.error('Suchfehler:', error.message);
        return [];
    }
}

// === EPISODEN (von der Anime-Detailseite) ===
async function extractEpisodes(url) {
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);
        const episodes = [];

        // Basierend auf deinem HTML-Code: Episoden sind in einer Liste
        $('.episode-list tr, .episode-row, .episode-item').each((index, element) => {
            const episodeLinkElement = $(element).find('a[href*="/anime/"]');
            const episodeNumber = $(element).find('.episode-number, td:first-child').text().trim();
            
            const episodeUrl = episodeLinkElement.attr('href');
            
            // Prüfe auf Deutsch (Ger Sub / Ger Dub)
            let episodeTitle = `Episode ${episodeNumber || index + 1}`;
            const text = $(element).text();
            if (text.includes('Ger Sub') || text.includes('German Sub')) {
                episodeTitle += ' [Ger Sub]';
            } else if (text.includes('Ger Dub') || text.includes('German Dub')) {
                episodeTitle += ' [Ger Dub]';
            }

            if (episodeUrl) {
                episodes.push({
                    title: episodeTitle,
                    url: toAbsoluteUrl(episodeUrl),
                    number: index + 1
                });
            }
        });

        return episodes;
    } catch (error) {
        console.error('Episoden-Fehler:', error.message);
        return [];
    }
}

// === STREAM-URL (von der Episodenseite) ===
async function extractStreamUrl(url) {
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);
        
        // Suche nach Video-URL in iframes oder video-tags
        let videoUrl = null;
        
        // Oft sind die Streams in iframes eingebettet (Vidoza, Streamtape, etc.)
        const iframe = $('iframe').attr('src');
        if (iframe) {
            videoUrl = iframe;
        }
        
        // Manchmal auch direkt in video-tags
        if (!videoUrl) {
            videoUrl = $('video source').attr('src');
        }
        
        // Oder in data-attributen
        if (!videoUrl) {
            videoUrl = $('[data-video]').attr('data-video');
        }

        return videoUrl ? toAbsoluteUrl(videoUrl) : null;
    } catch (error) {
        console.error('Stream-Fehler:', error.message);
        return null;
    }
}

module.exports = {
    extractDetails,
    searchResults,
    extractEpisodes,
    extractStreamUrl
};
