// service.js - TESTVERSION mit festen Animes
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

// === TEST: Feste Anime-Liste (ignoriert die Webseite) ===
async function extractDetails(url) {
    // Gibt TEST-Animes zurück - OHNE Scraping!
    return [
        { 
            title: "One Piece (TEST)", 
            thumbnail: "https://via.placeholder.com/150", 
            link: "https://anime-base.net/anime/one-piece" 
        },
        { 
            title: "Jujutsu Kaisen (TEST)", 
            thumbnail: "https://via.placeholder.com/150", 
            link: "https://anime-base.net/anime/jujutsu-kaisen" 
        },
        { 
            title: "Demon Slayer (TEST)", 
            thumbnail: "https://via.placeholder.com/150", 
            link: "https://anime-base.net/anime/demon-slayer" 
        }
    ];
}

async function searchResults(keyword) {
    // Einfache Suche - filtert die Test-Animes
    const testAnimes = await extractDetails();
    if (!keyword) return testAnimes;
    
    return testAnimes.filter(anime => 
        anime.title.toLowerCase().includes(keyword.toLowerCase())
    );
}

async function extractEpisodes(url) {
    // Test-Episoden
    return [
        { title: "Episode 1 [Ger Sub]", url: "https://anime-base.net/episode/1", number: 1 },
        { title: "Episode 2 [Ger Sub]", url: "https://anime-base.net/episode/2", number: 2 },
        { title: "Episode 3 [Ger Dub]", url: "https://anime-base.net/episode/3", number: 3 }
    ];
}

async function extractStreamUrl(url) {
    // Test-Stream
    return "https://test-stream.com/video.mp4";
}

module.exports = {
    extractDetails,
    searchResults,
    extractEpisodes,
    extractStreamUrl
};
