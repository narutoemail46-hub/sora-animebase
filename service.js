// service.js für Anime-Base.net
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
async function extractDetails(url = 'https://anime-base.net/anime') {
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);
        const animeList = [];

        // !!! HIER DEN RICHTIGEN CONTAINER-SELEKTOR EINSETZEN !!!
        // Beispiel: $('.series-list .item').each(...
        $('!!! CONTAINER_SELECTOR !!!').each((index, element) => {
            // !!! HIER DIE SELEKTOREN FÜR TITEL, BILD UND LINK EINSETZEN !!!
            const title = $(element).find('!!! TITLE_SELECTOR !!!').text().trim();
            const thumbnail = $(element).find('!!! IMAGE_SELECTOR !!!').attr('src');
            const link = $(element).find('!!! LINK_SELECTOR !!!').attr('href');

            if (title && link) {
                animeList.push({
                    title: title,
                    thumbnail: thumbnail || '',
                    link: toAbsoluteUrl(link)
                });
            }
        });

        return animeList;
    } catch (error) {
        console.error('Fehler in extractDetails:', error.message);
        return [];
    }
}

// === SUCHE ===
async function searchResults(keyword) {
    if (!keyword) return [];
    const searchUrl = `https://anime-base.net/anime?title=${encodeURIComponent(keyword)}`;
    
    try {
        const response = await axios.get(searchUrl, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);
        const results = [];

        // !!! HIER DIESELBEN SELEKTOREN WIE OBEN EINSETZEN !!!
        $('!!! CONTAINER_SELECTOR !!!').each((index, element) => {
            const title = $(element).find('!!! TITLE_SELECTOR !!!').text().trim();
            const thumbnail = $(element).find('!!! IMAGE_SELECTOR !!!').attr('src');
            const link = $(element).find('!!! LINK_SELECTOR !!!').attr('href');

            results.push({
                title: title,
                thumbnail: thumbnail || '',
                link: toAbsoluteUrl(link)
            });
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
        const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);
        const episodes = [];

        // !!! SELEKTOR FÜR DIE EPISODENLISTE !!!
        $('!!! EPISODE_CONTAINER !!!').each((index, element) => {
            // !!! SELEKTOR FÜR EPISODEN-LINK UND -NUMMER !!!
            const episodeLink = $(element).find('!!! EPISODE_LINK !!!').attr('href');
            const episodeNumber = $(element).find('!!! EPISODE_NUMBER !!!').text().trim();

            if (episodeLink) {
                episodes.push({
                    title: `Episode ${episodeNumber || index + 1}`,
                    url: toAbsoluteUrl(episodeLink),
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

// === STREAM ===
async function extractStreamUrl(url) {
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);
        
        // Suche nach Video-URL (häufig in iframes oder video-tags)
        let videoUrl = $('video source').attr('src') || 
                      $('iframe').attr('src') || 
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
