const Nightmare = require('nightmare')
const nightmare = Nightmare({
    show: false
});

let balance = 5000;
let superCount = 1;
let count = 0;
let superLinks = [];
let companies = {};
let ownedStocks = {};

GetCompanyList();

function GetCompanyList() {
    return nightmare
        .goto('https://se.investing.com/stock-screener/?sp=country::9|sector::a|industry::a|equityType::a|last::0.006,60%3Ceq_market_cap;' + superCount)
        .wait("#resultsTable tbody .flag")
        .wait(2000)
        .evaluate(() => {
            return Array.from(document.querySelectorAll("td > a")).map(a => a.href);
        })
        .then(links => {
            superLinks = links;
            return GetCompanyDetails(links[count]);
        })
        .then(() => {
            superCount++;
            if (superCount < 14) return GetCompanyList(superCount)
        })
        .then(() => nightmare.end())
        .catch(error => {
            console.error('Search failed:', error)
        })

}


function GetCompanyDetails(link) {
    let position = link.indexOf("?");
    let output
    if (position > 0) {
        output = [link.slice(0, position), "-technical", link.slice(position)].join('');
    } else {
        output = link + "-technical";
    }
    console.log(output);
    return nightmare.goto(output)
        .wait(".summary")
        .evaluate(() => {
            return {
                summary: document.querySelector(".summary span").innerHTML,
                name: document.querySelector("h1").innerHTML.replace("\t", ""),
                lastPrice: parseFloat(document.querySelector("#last_last").innerHTML.replace(",", "."))
            }
        })
        .then((data) => {
            /*console.log(data.summary);
            console.log(data.name);*/
            companies[data.name] = data;
            //console.log(companies);
            HandleSummary(data);
            if (count < superLinks.length) {
                return GetCompanyDetails(superLinks[count++]);
            }
        })
}

function HandleSummary(company) {
    if (ownedStocks[company.name] == "undefined") {
        console.log("A");
        if (company.summary === "Starkt Köp" || company.summary === "Köp") {
            console.log("B");
            while (true) {
                console.log("C");
                let amountOfStocks = Math.floor((Math.random() * 15) + 1);
                let price = amountOfStocks * company.lastPrice
                if (price <= balance) {
                    console.log("D");
                    balance -= price;
                    console.log("Bought " + amountOfStocks + " in " + company.name + " for a total of: " + price);
                    console.log("Current balance: " + balance);
                    break;
                }
            }
            company.amountOfStocks = amountOfStocks;
            ownedStocks[company.name] = company;
        }
    } else {
        console.log("E");
        if (company.summary === "Starkt Sälj" || company.summary === "Sälj") {
            console.log("F")
            let price = company.lastPrice * ownedStocks[company.name].amountOfStocks;
            balance += price
            console.log("Sold " + ownedStocks[company.name].amountOfStocks + " in " + company.name + " for a total of: " + price);
            console.log("Current balance: " + balance);
            ownedStocks[company.name] = "undefined";
        }
    }
}