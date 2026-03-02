async function discover() {
    const response = await request.get('https://animebase.to');
    const html = response.data;
    const animeList = [];

    // Wir suchen alle Anime-Boxen auf der Liste
    const items = html.select('div.col-md-3.col-sm-6.col-xs-6');

    items.forEach((item) => {
        const title = item.selectFirst('h3').text().trim();
        const thumbnail = item.selectFirst('img').attr('src');
        const link = item.selectFirst('a').attr('href');

        if (link) {
            animeList.push({
                title: title,
                thumbnail: thumbnail,
                link: link.startsWith('http') ? link : 'https://animebase.to' + link
            });
        }
    });

    return animeList;
}

module.exports = { discover };
