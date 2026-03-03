const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://anime-base.net';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function toAbsoluteUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return BASE_URL + url;
}

async function extractDetails(url = BASE_URL + '/anime-liste') {
    try {
        const { data } = await axios.get(url, { 
            headers: { 'User-Agent': USER_AGENT },
            timeout: 10000
        });
        
        const $ = cheerio.load(data);
        const results = [];

        $('.group').each((_, el) => {
            const linkEl = $(el).find('a[href^="/anime/"]').first();
            const titleEl = $(el).find('h3').first();
            const imgEl = $(el).find('img').first();

            const link = linkEl.attr('href');
            const title = titleEl.text().trim();
            const thumbnail = imgEl.attr('src') || imgEl.attr('data-src');

            if (link && title) {
                results.push({
                    title: title,
                    thumbnail: toAbsoluteUrl(thumbnail) || '',
                    link: toAbsoluteUrl(link)
                });
            }
        });

        return results;
    } catch (error) {
        console.error('extractDetails error:', error.message);
        return [];
    }
}

async function searchResults(keyword) {
    if (!keyword) return [];
    const url = `${BASE_URL}/anime-liste?title=${encodeURIComponent(keyword)}`;
    
    try {
        const { data } = await axios.get(url, { 
            headers: { 'User-Agent': USER_AGENT },
            timeout: 10000
        });
        
        const $ = cheerio.load(data);
        const results = [];

        $('.group').each((_, el) => {
            const linkEl = $(el).find('a[href^="/anime/"]').first();
            const titleEl = $(el).find('h3').first();
            const imgEl = $(el).find('img').first();

            const link = linkEl.attr('href');
            const title = titleEl.text().trim();
            const thumbnail = imgEl.attr('src') || imgEl.attr('data-src');

            if (link && title) {
                results.push({
                    title: title,
                    thumbnail: toAbsoluteUrl(thumbnail) || '',
                    link: toAbsoluteUrl(link)
                });
            }
        });

        return results.slice(0, 20);
    } catch (error) {
        console.error('searchResults error:', error.message);
        return [];
    }
}

async function extractEpisodes(url) {
    try {
        const { data } = await axios.get(url, { 
            headers: { 'User-Agent': USER_AGENT },
            timeout: 10000
        });
        
        const $ = cheerio.load(data);
        const episodes = [];

        $('a[href*="/episode/"]').each((i, el) => {
            const href = $(el).attr('href');
            if (href) {
                episodes.push({
                    title: `Episode ${i + 1}`,
                    url: toAbsoluteUrl(href),
                    number: i + 1
                });
            }
        });

        return episodes;
    } catch (error) {
        console.error('extractEpisodes error:', error.message);
        return [];
    }
}

async function extractStreamUrl(url) {
    try {
        const { data } = await axios.get(url, { 
            headers: { 'User-Agent': USER_AGENT },
            timeout: 10000
        });
        
        const $ = cheerio.load(data);
        const iframeSrc = $('iframe').attr('src');
        const videoSrc = $('video source').attr('src');
        
        return toAbsoluteUrl(iframeSrc || videoSrc);
    } catch (error) {
        console.error('extractStreamUrl error:', error.message);
        return null;
    }
}

module.exports = {
    extractDetails,
    searchResults,
    extractEpisodes,
    extractStreamUrl
};
