var stocks = [];
var newsNames = [];
var parsedNews = [];
var parsedVideos = [];
var jsonNews = [];
var jsonVideo = [];

var stockList;
if(localStorage.length === 0) {
  stockList = ["GOOG", "DIS", "AAPL", "MO", "TWTR", "FB"];
}else{
  stockList = localStorage.getItem("stockList").split(",");
}

function requestStockInfo() {
  return new Promise(function(resolve) {
    var stockRequest = new XMLHttpRequest();
    stockRequest.overrideMimeType("application/json");
    stockRequest.onreadystatechange = function() {
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
        resolve(stocks);
      }
    };
    stockRequest.open("GET", "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20(%22" + stockList[0] +"%22%2C%22" + stockList[1] + "%22%2C%22" + stockList[2] + "%22%2C%22" + stockList[3] + "%22%2C%22" + stockList[4] + "%22%2C%22" + stockList[5] + "%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=", true);
    stockRequest.send(null);
  });
}

function StockData (stockSym, stockName, stockPrice, marketCap, daysHigh, daysLow) {
  this.stockSym = stockSym;
  this.stockName = stockName;
  this.stockPrice = stockPrice;
  this.marketCap = marketCap;
  this.daysHigh = daysHigh;
  this.daysLow = daysLow;
}

function requestNews(item, index) {
  return new Promise(function(resolve) {
    var news = new XMLHttpRequest();
    news.overrideMimeType("application/json");
    news.open("GET", "https://api.datamarket.azure.com/Bing/Search/v1/Composite?Sources=%27news%27&Query=%27" + newsNames[index] + "%27&NewsCategory=%27rt_Business%27&$format=json", true);
    news.setRequestHeader("Authorization", "Basic " + "OkcxQXhzMkVaUjliV2t0VEUyRWkrUFZWUmRtNFBDZU1HSVBoR3Z2enJwK1k=");
    news.send(null);
    news.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        parsedNews[index] = JSON.parse(this.responseText);
        resolve(parsedNews[index]);
      }
    };
  });
}

function newsPromise(array) {
  console.log("pasedNews");
  return Promise.all(array.map(requestNews));
}

function requestVideos(item, index) {
  return new Promise(function(resolve) {
    var news = new XMLHttpRequest();
    news.overrideMimeType("application/json");
    news.open("GET", "https://api.datamarket.azure.com/Bing/Search/v1/Composite?Sources=%27video%27&Query=%27" + item + "%27&NewsCategory=%27rt_Business%27&$format=json&$top=15", true);
    news.setRequestHeader("Authorization", "Basic " + "OkcxQXhzMkVaUjliV2t0VEUyRWkrUFZWUmRtNFBDZU1HSVBoR3Z2enJwK1k=");
    news.send(null);
    news.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        parsedVideos[index] = JSON.parse(this.responseText);
        resolve(parsedVideos[index]);
      }
    };
  });
}

function videoPromise(array) {
  console.log("parsedVideos");
  return Promise.all(array.map(requestVideos));
}


function createCluster() {
  for(var i = 0; i < stockList.length - 1; i++) {
    var rowDiv = document.querySelector(".rowDiv");
    var cloneCluster = document.querySelector(".cluster").cloneNode(true);
    rowDiv.appendChild(cloneCluster);
  }
}

function createNewsFeed() {
  parsedNews.forEach(function (item, index) {
    item.d.results[0].News.forEach(function(item2, index2) {
      var newsFeed = document.querySelectorAll(".newsFeed")[index];
      var cloneArticle = document.querySelector(".article").cloneNode(true);
      newsFeed.appendChild(cloneArticle);
    });
  });
}

function createVideoFeed() {
  parsedVideos.forEach(function (item, index) {
    item.d.results[0].Video.forEach(function(item2, index2) {
      var videoFeed = document.querySelectorAll(".videoFeed")[index];
      var cloneVideoImage = document.querySelector(".videoImage").cloneNode(true);
      videoFeed.appendChild(cloneVideoImage);
    });
  });
}

function setStockData() {
  stocks.forEach(function(item, index) {
    document.querySelectorAll(".sym")[index].textContent = item.stockSym;
    document.querySelectorAll(".stockTable .name")[index].textContent = item.stockName;
    document.querySelectorAll(".stockTable .price")[index].textContent = item.stockPrice;
    document.querySelectorAll(".stockTable .hi")[index].textContent = item.daysHigh;
    document.querySelectorAll(".stockTable .low")[index].textContent = item.daysLow;
    document.querySelectorAll(".stockTable .marketCap")[index].textContent = stocks[index].marketCap;
  });
}

function setNewsData() {
  parsedNews.forEach(function(item, index) {
    item.d.results[0].News.forEach(function(item2, index2) {
      document.querySelectorAll(".newsFeed")[index].querySelectorAll(".title")[index2].textContent = item2.Title;
      document.querySelectorAll(".newsFeed")[index].querySelectorAll(".source")[index2].textContent = item2.Source;
      document.querySelectorAll(".newsFeed")[index].querySelectorAll(".date")[index2].textContent = item2.Date;
      document.querySelectorAll(".newsFeed")[index].querySelectorAll(".description")[index2].textContent = item2.Description;
      document.querySelectorAll(".newsFeed")[index].querySelectorAll("a")[index2].setAttribute("href", item2.Url);
    });
  });
}

function setVideoData() {
  parsedVideos.forEach(function(item, index) {
    item.d.results[0].Video.forEach(function(item2, index2) {
      document.querySelectorAll(".videoFeed")[index].querySelectorAll(".anchorVideo")[index2].textContent = item2.Title;
      document.querySelectorAll(".videoFeed")[index].querySelectorAll(".anchorVideo")[index2].setAttribute("href", item2.MediaUrl);
      document.querySelectorAll(".videoFeed")[index].querySelectorAll("img")[index2].setAttribute("src", item2.Thumbnail.MediaUrl);
    });
  });
}

requestStockInfo().then(function(value) {
  return Promise.all([newsPromise(newsNames), videoPromise(newsNames)]);
}).then(function() {
  createCluster();
  createNewsFeed();
  createVideoFeed();
  setStockData();
  setNewsData();
  setVideoData();
  stockList.forEach(symChangeEventConstructor);
});

function symChangeEventConstructor(item, index) {
  var sym = document.querySelectorAll(".sym");
  sym[index].addEventListener("click", function() {
    if(confirm("\nWould you like to change this stock?\n\n")) {
      var result = prompt("\nWhat is the stock symbol of the company you'd like to replace " + this.textContent + " with?\n\n");
      if(stockList.indexOf(result) !== -1) {
        if(confirm("\n" + stockList[index] + " is already in your portfolio. You must enter a stock that is not already in you portfolio\n\n")) {
          sym[index].click();
        }
      }else if(result !== null && stockList.indexOf(result) === -1){
        stockList[index] = result.toUpperCase();
        localStorage.setItem("stockList", stockList);
        requestStockInfo();
        setSym();
      }
    }
  });
}
