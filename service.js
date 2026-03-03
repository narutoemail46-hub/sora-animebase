// service.js für Anime-Base.net - FINALE VERSION!
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

async function extractDetails(url = 'https://anime-base.net/anime-liste') {
    try {
        const response = await axios.get(url, { 
            headers: { 'User-Agent': USER_AGENT } 
        });
        
        const $ = cheerio.load(response.data);
        const animeList = [];

        // Jedes Element mit der Klasse "group" ist ein Anime
        $('.group').each((index, element) => {
            // Titel aus h3
            const titleElement = $(element).find('h3');
            const title = titleElement.text().trim();
            
            // Bild
            const imageElement = $(element).find('img');
            const thumbnail = imageElement.attr('src') || imageElement.attr('data-src');
            
            // Link
            const linkElement = $(element).find('a[href^="/anime/"]');
            const link = linkElement.attr('href');

            // Sprach-Erkennung
            const hasGerSub = $(element).find('.bg-blue-500\\/20').length > 0;
            const hasGerDub = $(element).find('.bg-green-500\\/20').length > 0;
            
            let titleWithLang = title;
            if (hasGerSub) titleWithLang += ' [Ger Sub]';
            if (hasGerDub) titleWithLang += ' [Ger Dub]';

            if (title && link) {
                animeList.push({
                    title: titleWithLang,
                    thumbnail: thumbnail ? toAbsoluteUrl(thumbnail) : '',
                    link: toAbsoluteUrl(link)
                });
            }
        });

        console.log(`[AnimeBase] Gefundene Animes: ${animeList.length}`);
        return animeList;
    } catch (error) {
        console.error('Fehler:', error.message);
        return [];
    }
}

async function searchResults(keyword) {
    if (!keyword) return [];
    const searchUrl = `https://anime-base.net/anime-liste?title=${encodeURIComponent(keyword)}`;
    
    try {
        const response = await axios.get(searchUrl, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);
        const results = [];

        // Gleiche Logik wie oben
        $('.group').each((index, element) => {
            const title = $(element).find('h3').first().text().trim();
            const thumbnail = $(element).find('img').first().attr('src') || $(element).find('img').first().attr('data-src');
            const link = $(element).find('a[href^="/anime/"]').first().attr('href');
            
            const hasGerSub = $(element).find('.bg-blue-500\\/20').length > 0;
            const hasGerDub = $(element).find('.bg-green-500\\/20').length > 0;
            
            let titleWithLang = title;
            if (hasGerSub) titleWithLang += ' [Ger Sub]';
            if (hasGerDub) titleWithLang += ' [Ger Dub]';

            if (title && link && title.toLowerCase().includes(keyword.toLowerCase())) {
                results.push({
                    title: titleWithLang,
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

async function extractEpisodes(url) {
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);
        const episodes = [];

        $('a[href*="/anime/"]').each((index, element) => {
            const href = $(element).attr('href');
            if (href && href.includes('/episode/')) {
                episodes.push({
                    title: `Episode ${index + 1}`,
                    url: toAbsoluteUrl(href),
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

async function extractStreamUrl(url) {
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);
        
        let videoUrl = $('iframe').attr('src') || 
                      $('video source').attr('src') || 
                      $('[data-video]').attr('data-video');

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
