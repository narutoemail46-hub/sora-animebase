// service.js - Alles in einer Datei für Sora

const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const BASE_URL = 'https://animebase.to';

// Hilfsfunktion für absolute URLs
function toAbsoluteUrl(relativeUrl) {
    if (!relativeUrl) return null;
    try {
        return new URL(relativeUrl, BASE_URL).href;
    } catch (e) {
        return null;
    }
}

// === DISCOVER / ENTDECKEN ===
async function extractDetails(url = 'https://animebase.to/anime/liste') {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(response.data);
        const animeList = [];

        // WICHTIG: HIER MUSST DU DIE SELEKTOREN EINSETZEN!
        $('.anime-item').each((index, element) => {
            const title = $(element).find('.title').text().trim();
            const thumbnail = $(element).find('img').attr('src');
            const link = $(element).find('a').attr('href');

            if (link) {
                animeList.push({
                    title: title,
                    thumbnail: thumbnail || '',
                    link: toAbsoluteUrl(link)
                });
            }
        });

        return animeList;
    } catch (error) {
        console.error('Fehler:', error.message);
        return [];
    }
}

// === SUCHE ===
async function searchResults(keyword) {
    if (!keyword) return [];
    
    const searchUrl = `https://animebase.to/anime/liste?search=${encodeURIComponent(keyword)}`;

    try {
        const response = await axios.get(searchUrl, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(response.data);
        const results = [];

        // GLEICHE SELEKTOREN WIE OBEN!
        $('.anime-item').each((index, element) => {
            const title = $(element).find('.title').text().trim();
            const thumbnail = $(element).find('img').attr('src');
            const link = $(element).find('a').attr('href');

            if (title.toLowerCase().includes(keyword.toLowerCase())) {
                results.push({
                    title: title,
                    thumbnail: thumbnail || '',
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

// === EPISODEN ===
async function extractEpisodes(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(response.data);
        const episodes = [];

        // EPISODEN-SELEKTOREN ANPASSEN!
        $('.episode-row').each((index, element) => {
            const episodeLink = $(element).find('a').attr('href');
            const episodeNumber = $(element).find('.episode-nr').text().trim();

            let episodeTitle = `Episode ${episodeNumber || index + 1}`;
            
            // Prüfe auf Deutsch
            const text = $(element).text();
            if (text.includes('Ger Dub')) {
                episodeTitle += ' [Ger Dub]';
            } else if (text.includes('Ger Sub')) {
                episodeTitle += ' [Ger Sub]';
            }

            if (episodeLink) {
                episodes.push({
                    title: episodeTitle,
                    url: toAbsoluteUrl(episodeLink),
                    number: index + 1
                });
            }
        });

        return episodes.reverse();
    } catch (error) {
        console.error('Episoden-Fehler:', error.message);
        return [];
    }
}

// === STREAM ===
async function extractStreamUrl(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(response.data);
        
        // Suche nach Video-URL
        let videoUrl = $('video source').attr('src');
        
        if (!videoUrl) {
            // Suche nach Iframe
            const iframe = $('iframe').attr('src');
            if (iframe) {
                videoUrl = iframe;
            }
        }
        
        if (!videoUrl) {
            // Suche nach data-attributen
            videoUrl = $('[data-video]').attr('data-video');
        }

        return videoUrl ? toAbsoluteUrl(videoUrl) : null;
    } catch (error) {
        console.error('Stream-Fehler:', error.message);
        return null;
    }
}

// === EXPORT - GANZ WICHTIG! ===
module.exports = {
    extractDetails,
    searchResults,
    extractEpisodes,
    extractStreamUrl
};
