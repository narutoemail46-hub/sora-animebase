async function media(url) {
    const res = await request.get(url);
    const links = res.data.select('a.btn-hoster');
    return links.map(l => ({
        name: l.text().trim(),
        url: l.attr('href'),
        isExternal: true
    }));
}
module.exports = { media };
