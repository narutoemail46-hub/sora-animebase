async function search(query) {
    const res = await request.get(`https://animebase.to{encodeURIComponent(query)}`);
    const items = res.data.select('div.col-md-3.col-sm-6.col-xs-6');
    return items.map(item => ({
        title: item.selectFirst('h3').text().trim(),
        thumbnail: item.selectFirst('img').attr('src'),
        link: 'https://animebase.to' + item.selectFirst('a').attr('href')
    }));
}
module.exports = { search };
