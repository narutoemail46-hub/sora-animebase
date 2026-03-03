// service.js - Minimale Version
async function extractDetails(url) {
    return [
        { title: "One Piece", thumbnail: "", link: "https://anime-base.net/anime/one-piece" },
        { title: "Jujutsu Kaisen", thumbnail: "", link: "https://anime-base.net/anime/jujutsu-kaisen" }
    ];
}

async function searchResults(keyword) {
    return extractDetails();
}

async function extractEpisodes(url) {
    return [{ title: "Episode 1", url: "https://anime-base.net/episode/1", number: 1 }];
}

async function extractStreamUrl(url) {
    return "https://test-stream.com/video.mp4";
}

module.exports = {
    extractDetails,
    searchResults,
    extractEpisodes,
    extractStreamUrl
};
