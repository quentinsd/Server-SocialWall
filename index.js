const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;
const io = require("socket.io")(5050);
io.origins("*:*");
require("dotenv").config();

const Twit = require("twit");
const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: false // optional - requires SSL certificates to be valid.
});

express()
  .get("/", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    const tag = req.query.tag;

    T.get(
      "search/tweets",
      {
        q: tag,
        count: 100,
        include_entities: true,
        tweet_mode: "extended"
      },
      function(err, data, response) {
        const stream = T.stream("statuses/filter", {
          track: tag
        });

        stream.on("tweet", function(tweet) {
          console.log(tweet);
          io.emit(`#${tag}`, tweet);
        });

        stream.on("error", function(error) {
          console.error(error);
        });
        res.send(data);
      }
    );
  })
  // .get("/stream", (req, res) => {
  //   res.header("Access-Control-Allow-Origin", "*");
  //   res.header(
  //     "Access-Control-Allow-Headers",
  //     "Origin, X-Requested-With, Content-Type, Accept"
  //   );
  //   const stream = T.stream("statuses/filter", {
  //     track: `#wallwcstest`
  //   });

  //   stream.on("tweet", function(tweet) {
  //     console.log(tweet);
  //   });

  //   stream.on("error", function(error) {
  //     console.error(error);
  //   });
  //   res.send("TOTO");
  // })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
