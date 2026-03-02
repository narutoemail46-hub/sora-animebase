async function media(url) {
    const response = await request.get(url);
    const html = response.data;
    const streams = [];

    // Sucht nach den Hoster-Buttons (Vidoza, Streamtape, etc.)
    const hosterLinks = html.select('a.btn-hoster');

    hosterLinks.forEach((link) => {
        const hosterUrl = link.attr('href');
        const hosterName = link.text().trim();

        if (hosterUrl) {
            streams.push({
                name: hosterName,
                url: hosterUrl,
                isExternal: true // Da Sora die Hoster meist extern öffnen muss
            });
        }
    });

    return streams;
}

module.exports = { media };
