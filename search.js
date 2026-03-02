async function search(keyword) {
    const url = `https://animebase.to{encodeURIComponent(keyword)}`;
    const response = await request.get(url);
    const html = response.data;
    const results = [];

    // Suchergebnisse auf AnimeBase auslesen
    const items = html.select('div.col-md-3.col-sm-6.col-xs-6');

    items.forEach((item) => {
        const title = item.selectFirst('h3').text().trim();
        const thumbnail = item.selectFirst('img').attr('src');
        const link = item.selectFirst('a').attr('href');

        if (link) {
            results.push({
                title: title,
                thumbnail: thumbnail,
                link: link.startsWith('http') ? link : 'https://animebase.to' + link
            });
        }
    });

    return results;
}

module.exports = { search };
