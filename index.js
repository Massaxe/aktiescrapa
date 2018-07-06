const rp = require('request-promise');
const cheerio = require("cheerio");

let counter = 1;
let url = "https://se.investing.com/stock-screener/?sp=country::9|sector::a|industry::a|equityType::a|exchange::a%3Elast;" + counter;

const options = {
    uri: url,
    transform: (body) => {
        return cheerio.load(body)
    },
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36"
    }
}

function callback(err, httpResponse, body) {
    let $;
    setTimeout(function () {
        $ = cheerio.load(body);
        console.log($.html());
        let items = $('tbody').find($('.symbol')).html();
        console.log(items);
    }, 2000)

}

rp(options).then(($) => {
    setTimeout(function () {
        console.log($.html());
        let items = $('tbody').find($('.symbol')).html();
        console.log(items);
    }, 2000)
})