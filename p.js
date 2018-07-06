var webPage = require('webpage');
var page = webPage.create();

let counter = 1;
let url = "https://se.investing.com/stock-screener/?sp=country::9|sector::a|industry::a|equityType::a|exchange::a%3Elast;" + counter;

page.open('http://phantomjs.org', function (status) {
    setTimeout(() => {
        var content = page.content;
        console.log('Content: ' + content);
        phantom.exit();
    }, 4000);
});