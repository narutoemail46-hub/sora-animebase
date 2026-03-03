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
        const { data } = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
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
    } catch { return []; }
}

async function searchResults(keyword) {
    if (!keyword) return [];
    try {
        const { data } = await axios.get(`${BASE_URL}/anime-liste?title=${encodeURIComponent(keyword)}`, {
            headers: { 'User-Agent': USER_AGENT }
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
    } catch { return []; }
}

async function extractEpisodes(url) {
    try {
        const { data } = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
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
    } catch { return []; }
}

async function extractStreamUrl(url) {
    try {
        const { data } = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(data);
        return toAbsoluteUrl($('iframe').attr('src') || $('video source').attr('src'));
    } catch { return null; }
}

module.exports = {
    extractDetails,
    searchResults,
    extractEpisodes,
    extractStreamUrl
};
