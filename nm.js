require('events').EventEmitter.prototype._maxListeners = 100;
const nightmare = require('nightmare')({
        show: false
    }),
    vo = require('vo'),
    cheerio = require("cheerio"),
    fs = require("fs"),
    path = require("path");

let orgUrl = "https://se.investing.com/stock-screener/?sp=country::9|sector::a|industry::a|equityType::a|exchange::a%3Elast;1";
let counter = 1;
let htmlArray = [];
let linkArray = [];
let companies = [];


function IterateGetHTML(count) {
    return nightmare
        .goto(`https://se.investing.com/stock-screener/?sp=country::9|sector::a|industry::a|equityType::a|exchange::a%3Elast;${count}`)
        .wait(`#resultsTable`)
        .wait(1000)
        .evaluate(() => document.querySelector('#resultsTable').innerHTML)
        .then((html) => {
            console.log("Document number: " + count);
            htmlArray.push(html);
            if (count < 21) {
                return IterateGetHTML(count + 1);
            } else {
                return;
            }
        });
}

function GetHTML() {
    nightmare
        .goto('https://se.investing.com/')
        .then(() => {
            htmlArray = [];
            return IterateGetHTML(1);
        })
        .then(() => {
            return nightmare.end(() => {
                console.log("Successfully grabbed HTML.");
                htmlArray.forEach(html => {
                    fs.writeFileSync(__dirname + "/scraped_files" + html.length + ".html", html, () => {})
                });
            })
        })
}

function ReadFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function (filename) {
            fs.readFile(dirname + "/" + filename, 'utf-8', function (err, content) {
                if (err) {
                    onError(err);
                    return;
                }
                onFileContent(filename, content);
            });
        });
    });
}



function GetTechnicalSummary() {
    nightmare
        .goto('https://se.investing.com/')
        .then(() => {
            htmlArray = [];
            return IterateGetTS(linkArray, 0);
        })
        .then(() => {
            return nightmare.end(() => {
                console.log("Successfully grabbed HTML.");
                ParseTechnicalSummary();
            })
        })

    function ParseTechnicalSummary() {
        htmlArray.forEach(html => {
            let $ = cheerio.load(html);
            let symbol = $("h1").text();
            companies.push({
                name: symbol
            })
            console.log(companies);
        })


    }
}

function IterateGetTS(links, count) {
    return nightmare
        .goto(`https://se.investing.com/${links[count]}`)
        .wait(`.technicalSummaryTbl`)
        .wait(1000)
        .evaluate(() => document.querySelector("body").innerHTML)
        .then((html) => {
            console.log("Document number: " + count);
            htmlArray.push(html);
            if (count < linkArray.length) {
                return IterateGetHTML(count + 1);
            } else {
                return;
            }
        });
}

ReadFiles(__dirname + "/scraped_files", function (filename, content) {
    $ = cheerio.load(content);
    let as = $("a");
    as.each((i, a) => {
        let link = $(a).attr('href');
        if (link.includes("equities")) {
            linkArray.push($(a).attr('href'));
        }
        if (i > as.length) {
            GetTechnicalSummary();
        }
    })
}, function (err) {
    throw err;
});



/*nightmare
    .goto(orgUrl)
    .wait("#resultsTable")
    .evaluate(() => {
        htmlArray.push(document.querySelector('#resultsTable').innerHTML)
    })
    .click(".blueRightSideArrowPaginationIcon")
    .end()
    .then(() => {
        console.log(htmlArray)
    })
    .catch(error => {
        console.error("Something went wrong: " + error);
    })*/







/*ScrapePage(counter);

function ScrapePage(pageNumber) {
    console.log(orgUrl + pageNumber);
    nightmare.useragent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36')
        .goto(orgUrl + pageNumber)
        .wait('#resultsTable')
        .evaluate(() => document.documentElement.innerHTML)
        .then(html => {
            fs.writeFileSync(path.join(__dirname, "page" + pageNumber + ".html"), html, (err) => {});
        })
        .end();
}*/




/*var run = function* () {
    var urls = ['https://se.investing.com/stock-screener/?sp=country::9|sector::a|industry::a|equityType::a|exchange::a%3Elast;1', 'https://se.investing.com/stock-screener/?sp=country::9|sector::a|industry::a|equityType::a|exchange::a%3Elast;2', 'https://se.investing.com/stock-screener/?sp=country::9|sector::a|industry::a|equityType::a|exchange::a%3Elast;3'];
    var htmls = [];
    for (var i = 0; i < urls.length; i++) {
        var html = yield nightmare.goto(urls[i])
            .wait('#resultsTable')
            .evaluate(() => document.documentElement.innerHTML)
        htmls.push(html);
    }
    return htmls;
}

vo(run)(function (err, htmls) {
    //console.dir(htmls);
    console.log(htmls.length);
    htmls.forEach(html => {
        fs.writeFileSync(path.join(__dirname, "page" + counter + ".html"), html, (err) => {});
        counter++;
        let $ = cheerio.load(html);
        let items = $('td.symbol').find("a").html();
        console.log(items)
    });

});

counter++;
if (counter < 21) {
                console.log("true");
                return ScrapePage(counter);
            } else {
                console.log("false");
                return false;
            }*/