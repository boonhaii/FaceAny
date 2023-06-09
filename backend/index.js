let routes = require("./routes");
let express = require("express");

let app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// Setup server port
var port = 3030;

// Send message for default URL
app.get("/helloworld", (req, res) => res.send("Hello World with Express"));

// Use Api routes in the App
app.use("/", routes);
// Launch app to listen to specified port
app.listen(port, function () {
  console.log("Running checkIn on port " + port);
});

module.exports = app;
