// service.js - MINIMALE TESTVERSION
const axios = require('axios');
const cheerio = require('cheerio');

async function extractDetails(url) {
    // Gibt einfach zwei Test-Animes zurück
    return [
        { title: "Test Anime 1", thumbnail: "", link: "https://animebase.to/test1" },
        { title: "Test Anime 2", thumbnail: "", link: "https://animebase.to/test2" }
    ];
}

async function searchResults(keyword) {
    return extractDetails();
}

async function extractEpisodes(url) {
    return [
        { title: "Episode 1 [Ger Sub]", url: "https://animebase.to/episode1", number: 1 }
    ];
}

async function extractStreamUrl(url) {
    return "https://test-stream-url.com/video.mp4";
}

module.exports = {
    extractDetails,
    searchResults,
    extractEpisodes,
    extractStreamUrl
};
