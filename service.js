// service.js - ULTIMATIVE TESTVERSION
const axios = require('axios');

async function extractDetails(url) {
    console.log("extractDetails wurde aufgerufen");
    return [
        { title: "TEST ANIME 1", thumbnail: "", link: "https://animebase.to/test1" },
        { title: "TEST ANIME 2", thumbnail: "", link: "https://animebase.to/test2" }
    ];
}

async function searchResults(keyword) {
    console.log("searchResults wurde aufgerufen für:", keyword);
    return extractDetails();
}

async function extractEpisodes(url) {
    console.log("extractEpisodes wurde aufgerufen für:", url);
    return [
        { title: "TEST Episode 1 [Ger Sub]", url: "https://animebase.to/ep1", number: 1 },
        { title: "TEST Episode 2 [Ger Dub]", url: "https://animebase.to/ep2", number: 2 }
    ];
}

async function extractStreamUrl(url) {
    console.log("extractStreamUrl wurde aufgerufen für:", url);
    return "https://test-stream.com/video.mp4";
}

// GANZ WICHTIG: DIESER EXPORT MUSS STIMMEN!
module.exports = {
    extractDetails,
    searchResults,
    extractEpisodes,
    extractStreamUrl
};
