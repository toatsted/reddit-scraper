const cheerio = require("cheerio");
const axios = require("axios");
const xl = require("excel4node");
const inquirer = require("inquirer");

let wb = new xl.Workbook();

let ws = wb.addWorksheet("reddit posts");
ws.column(1).setWidth(100);
ws.column(2).setWidth(100);

let style = wb.createStyle({
  font: {
    color: '#FF0800',
    size: 12,
  }
});

function scrape(SUBREDDIT) {
  axios({
    method: "get",
    url: `http://old.reddit.com/r/${SUBREDDIT}`
  }).then(response => {
    const $ = cheerio.load(response.data);

    $(".entry").each((i, post) => {
      let title = $(post).find("p.title").text();
      let url = $(post).find("a.title").attr("href");

      url = (url.charAt(0) === "/") ? "old.reddit.com" + url : url;

      ws.cell(i + 1, 1)
        .string(title)

      ws.cell(i + 1, 2)
        .string(url)
      
      if(process.argv.includes('-l')) {
        console.log(`
         ${ title  }
         ${ url }
         `)
      }
    })

    wb.write(`./spreadsheets/${SUBREDDIT}.xlsx`);

  }).catch(err => console.warn(err))
}

if(process.argv[2]) {
  scrape(process.argv[2]);
} else {
  inquirer.prompt({
    name: "subreddit",
    type: "text",
    
  }).then(answers => {
    scrape(answers.subreddit.trim());
  })
}

module.exports = scrape;
