// function and variable for gettting, parsing, and storing global stock info
var stockInfoJSON;

var stockList;
if(localStorage.length === 0) {
  stockList = ["GOOG", "DIS", "AAPL", "ORCL", "TWTR", "FB"];
}else{
  stockList = localStorage.getItem("stockList").split(",");
}

var newsNames = [];

var stocks = [];

var setStockData = function() {
  for(var i = 0; i < stocks.length; i++) {
    document.querySelectorAll(".stockTable .name")[i].textContent = stocks[i].stockName;
    document.querySelectorAll(".stockTable .price")[i].textContent = stocks[i].stockPrice;
    document.querySelectorAll(".stockTable .hi")[i].textContent = stocks[i].daysHigh;
    document.querySelectorAll(".stockTable .low")[i].textContent = stocks[i].daysLow;
    document.querySelectorAll(".stockTable .marketCap")[i].textContent = stocks[i].marketCap;
  }
  newsNames.forEach(requestNews);
};

function getQuote() {
  if(this.readyState == 4 && this.status == 200) {
    stockInfoJSON = JSON.parse(this.responseText);
    for(var i = 0; i < stockList.length; i++) {
      stocks[i] = new StockData(
        stockList[i],
        stockInfoJSON.query.results.quote[i].Name,
        stockInfoJSON.query.results.quote[i].LastTradePriceOnly,
        stockInfoJSON.query.results.quote[i].MarketCapitalization,
        stockInfoJSON.query.results.quote[i].DaysHigh,
        stockInfoJSON.query.results.quote[i].DaysLow);
      newsNames[i] = stocks[i].stockName.replace(/,/g, "").replace(/ /g, "%20");
    }
    setStockData();
  }
}



function requestStockInfo() {
  var stockRequest = new XMLHttpRequest();
  stockRequest.overrideMimeType("application/json");
  stockRequest.onreadystatechange = getQuote;
  stockRequest.open("GET", "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20(%22" + stockList[0] +"%22%2C%22" + stockList[1] + "%22%2C%22" + stockList[2] + "%22%2C%22" + stockList[3] + "%22%2C%22" + stockList[4] + "%22%2C%22" + stockList[5] + "%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=", true);
  stockRequest.send(null);
}
requestStockInfo();


// this is a constructor function for the stock data object
function StockData (stockSym, stockName, stockPrice, marketCap, daysHigh, daysLow) {
  this.stockSym = stockSym;
  this.stockName = stockName;
  this.stockPrice = stockPrice;
  this.marketCap = marketCap;
  this.daysHigh = daysHigh;
  this.daysLow = daysLow;
}

// populate stock data table @caption with stock symbols from @stockList
var sym = document.querySelectorAll(".sym");
function setSym() {
  for(var i = 0; i < sym.length; i++) {
    sym[i].textContent = stockList[i];
  }
}
setSym();


var parsedNews = [];

function requestNews(item, index) {
  var news = new XMLHttpRequest();
  news.overrideMimeType("application/json");
  news.open("GET", "https://api.datamarket.azure.com/Bing/Search/v1/Composite?Sources=%27news%27&Query=%27" + item + "%27&NewsCategory=%27rt_Business%27&$format=json", true);
  news.setRequestHeader("Authorization", "Basic " + "OkcxQXhzMkVaUjliV2t0VEUyRWkrUFZWUmRtNFBDZU1HSVBoR3Z2enJwK1k=");
  news.send(null);
  news.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      parsedNews[index] = JSON.parse(this.responseText);
      populateNews();
      newsNames.forEach(requestVideos);
      populateVideos();
    }
  };
}




function populateNews() {
  if(parsedNews.length === 6 && parsedNews[5].d.results[0].News[14].Title !== undefined) {
    var n = 0;
    for(var j = 0; j < parsedNews.length; j++){
      for(var i = 0; i < parsedNews[0].d.results[0].News.length; i++, n++) {
        document.querySelectorAll(".title")[n].textContent = parsedNews[j].d.results[0].News[i].Title;
        document.querySelectorAll(".source")[n].textContent = parsedNews[j].d.results[0].News[i].Source;
        document.querySelectorAll(".date")[n].textContent = parsedNews[j].d.results[0].News[i].Date;
        document.querySelectorAll(".description")[n].textContent = parsedNews[j].d.results[0].News[i].Description;
        document.querySelectorAll(".newsFeed a")[n].setAttribute("href", parsedNews[j].d.results[0].News[i].Url);
      }
      if(n === document.querySelectorAll(".title").length){
        n = 0;
      }
    }
  }else{
    setTimeout(populateNews, 1000);
  }
}

var parsedVideos = [];

function requestVideos(item, index) {
  var news = new XMLHttpRequest();
  news.overrideMimeType("application/json");
  news.open("GET", "https://api.datamarket.azure.com/Bing/Search/v1/Composite?Sources=%27video%27&Query=%27" + item + "%27&NewsCategory=%27rt_Business%27&$format=json&$top=15", true);
  news.setRequestHeader("Authorization", "Basic " + "OkcxQXhzMkVaUjliV2t0VEUyRWkrUFZWUmRtNFBDZU1HSVBoR3Z2enJwK1k=");
  news.send(null);
  news.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      parsedVideos[index] = JSON.parse(this.responseText);
    }
  };
}

function populateVideos() {
  if(parsedVideos.length === 6 && parsedVideos[5].d.results[0].Video[14].Title !== undefined) {
    var n = 0;
    for(var j = 0; j < parsedVideos.length; j++) {
      for(var i = 0; i < parsedVideos[0].d.results[0].Video.length; i++, n++) {
        document.querySelectorAll(".videoImage img")[n].setAttribute("src", parsedVideos[j].d.results[0].Video[i].Thumbnail.MediaUrl);
        document.querySelectorAll(".anchorVideo")[n].setAttribute("href", parsedVideos[j].d.results[0].Video[i].MediaUrl);
        document.querySelectorAll(".anchorVideo")[n].textContent = parsedVideos[j].d.results[0].Video[i].Title;
      }
      if(n === document.querySelectorAll(".anchorVideo").length){
        n = 0;
      }
    }
  }else{
    setTimeout(populateVideos, 1000);
  }
}


sym[0].addEventListener("click", function() {
  if(confirm("\nWould you like to change this stock?\n\n")) {
    var result = prompt("\nWhat is the stock symbol of the company you'd like to replace " + this.textContent + " with?\n\n");
    if(stockList.indexOf(result) !== -1) {
      if(confirm("\n" + stockList[0] + " is already in your portfolio. You must enter a stock that is not already in you portfolio\n\n")) {
        sym[0].click();
      }
    }else if(result !== null && stockList.indexOf(result) === -1){
      stockList[0] = result.toUpperCase();
      localStorage.setItem("stockList", stockList);
      requestStockInfo();
      setSym();
    }
  }
});
sym[1].addEventListener("click", function() {
  if(confirm("\nWould you like to change this stock?\n\n")) {
    // i want to prompt the user to enter info and check if the info is already present
    var result = prompt("\nWhat is the stock symbol of the company you'd like to replace " + this.textContent + " with?\n\n");
    if(stockList.indexOf(result) !== -1) {
      if(confirm("\n" + stockList[1] + " is already in your portfolio. You must enter a stock that is not already in you portfolio\n\n")) {
        sym[1].click();
      }
    }else if(result !== null && stockList.indexOf(result) === -1){
      stockList[1] = result.toUpperCase();
      localStorage.setItem("stockList", stockList);
      requestStockInfo();
      setSym();
    }
  }
});
sym[2].addEventListener("click", function() {
  if(confirm("\nWould you like to change this stock?\n\n")) {
    // i want to prompt the user to enter info and check if the info is already present
    var result = prompt("\nWhat is the stock symbol of the company you'd like to replace " + this.textContent + " with?\n\n");
    if(stockList.indexOf(result) !== -1) {
      if(confirm("\n" + stockList[2] + " is already in your portfolio. You must enter a stock that is not already in you portfolio\n\n")) {
        sym[2].click();
      }
    }else if(result !== null && stockList.indexOf(result) === -1){
      stockList[2] = result.toUpperCase();
      localStorage.setItem("stockList", stockList);
      requestStockInfo();
      setSym();
    }
  }
});
sym[3].addEventListener("click", function() {
  if(confirm("\nWould you like to change this stock?\n\n")) {
    // i want to prompt the user to enter info and check if the info is already present
    var result = prompt("\nWhat is the stock symbol of the company you'd like to replace " + this.textContent + " with?\n\n");
    if(stockList.indexOf(result) !== -1) {
      if(confirm("\n" + stockList[3] + " is already in your portfolio. You must enter a stock that is not already in you portfolio\n\n")) {
        sym[3].click();
      }
    }else if(result !== null && stockList.indexOf(result) === -1){
      stockList[3] = result.toUpperCase();
      localStorage.setItem("stockList", stockList);
      requestStockInfo();
      setSym();
    }
  }
});
sym[4].addEventListener("click", function() {
  if(confirm("\nWould you like to change this stock?\n\n")) {
    // i want to prompt the user to enter info and check if the info is already present
    var result = prompt("\nWhat is the stock symbol of the company you'd like to replace " + this.textContent + " with?\n\n");
    if(stockList.indexOf(result) !== -1) {
      if(confirm("\n" + stockList[4] + " is already in your portfolio. You must enter a stock that is not already in you portfolio\n\n")) {
        sym[4].click();
      }
    }else if(result !== null && stockList.indexOf(result) === -1){
      stockList[4] = result.toUpperCase();
      localStorage.setItem("stockList", stockList);
      requestStockInfo();
      setSym();
    }
  }
});
sym[5].addEventListener("click", function() {
  if(confirm("\nWould you like to change this stock?\n\n")) {
    // i want to prompt the user to enter info and check if the info is already present
    var result = prompt("\nWhat is the stock symbol of the company you'd like to replace " + this.textContent + " with?\n\n");
    if(stockList.indexOf(result) !== -1) {
      if(confirm("\n" + stockList[5] + " is already in your portfolio. You must enter a stock that is not already in you portfolio\n\n")) {
        sym[5].click();
      }
    }else if(result !== null && stockList.indexOf(result) === -1){
      stockList[5] = result.toUpperCase();
      localStorage.setItem("stockList", stockList);
      requestStockInfo();
      setSym();
    }
  }
});
