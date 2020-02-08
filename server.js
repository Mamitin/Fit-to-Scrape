// Dependencies
var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

var db = require("./app/models");

var app = express();
var PORT = process.env.PORT || 8080

app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var collections = ["scrapedData"];


var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// db.on("error", function (error) {
//     console.log("Error:", error);
// });

app.get("/", function (req, res) {
    res.render("index");
})

app.get("/scrape", function (req, res) {
    // db.scrapedData.drop()

    axios.get("https://www.realsimple.com/food-recipes")
        .then(function (response) {
            var $ = cheerio.load(response.data);
            $("article.type-article").each(function (i, element) {

                var title = $(element).find("div").attr("data-alt");
                console.log(title);
                // var summary = $(element).children("a").text();

                var baseURL = "https://www.realsimple.com";
                var link = baseURL + $(element).children("a").attr("href");
                console.log(link);

                var result = {
                    title: title,
                    link: link
                };

                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        // If an error occurred, log it
                        console.log(err);
                    });
            })
            res.send("Scrape Complete");
        });
})

app.listen(PORT, function () {
    console.log("App is listening on PORT: ", PORT);
})