/**
 * Express
 */
const express = require("express");
const exphbs = require("express-handlebars");
const cors = require("cors");
const path = require("path");
const app = express();

app.enable("view cache");
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

/**
 * Http
 */
const http = require("http").createServer(app);

/**
 * Socket.IO
 */
const io = require("socket.io")(http);

io.on("connection", socket => {
  console.log("[CONNECT] " + socket.id);

  socket.on("disconnect", () => console.log("[DISCONNECT] " + socket.id));
});

/**
 * Routes
 */
app.get("", (request, response) => {
  response.render("index");
});

app.get("/download", (request, response) => {
  if (request.query['platform'] === "windows") {
    response.download(path.join(__dirname, "public", "downloads", "Pensive Setup.exe"));
    return;
  }

  response.render("404", { url: request.query["platform"] });
  return;
})

app.get("*", (request, response) => {
  response.status(404);

  if (request.accepts("html")) {
    response.render("404", { url: request.url });
    return;
  }

  if (request.accepts("json")) {
    response.send({ error: "not-found", url: request.url });
    return;
  }

  response.type("txt").send("not-found");
});

/**
 * Server
 */
http.listen(3000, () => {
  console.log("Client server running on port: 3000");
});
