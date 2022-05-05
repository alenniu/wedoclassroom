const path = require("path");
const http = require("http");
const config = require("./config");
const express = require("express");
const sockets = require("socket.io");
const cookie_parser = require("cookie-parser")
const express_session = require("express-session")
const { get_file_extension } = require("./functions/utils");

const db_init = require("./database/init");

const db = db_init();

require("./database/schemas/users");
require("./database/schemas/classes");
require("./database/schemas/attachments");
require("./database/schemas/assignments");
require("./database/schemas/requests");
require("./database/schemas/schedule");
require("./database/schemas/attendance");
require("./database/schemas/scores");
require("./database/schemas/invoices");

const app = express();
const server = http.createServer(app);

app.use("/api", express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookie_parser());

app.use(express_session({
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
    },
    store: new express_session.MemoryStore(), /// should use mongostore in future
    resave: false,
    saveUninitialized: false,
    secret: config.SECRET, 
}));

app.get("/api", async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    res.json({msg: "Hello World", success: true, ip});
});

require("./routes/auth_routes")(app);
require("./routes/user_routes")(app);
require("./routes/admin_routes")(app);
require("./routes/class_routes")(app);

app.get("*", async(req, res, next) => {
    const url_path = req.url.split("?")[0];

    if(((url_path.split(".").length > 1) && /(html|webp|jpeg|png|jpg|gif|xml|mp4|mp3|js|json|txt|ico|svg|map|css|ttf|otf)/ig.test(get_file_extension(url_path))) || (url_path.indexOf("apple-developer-merchantid-domain-association") !== -1)){
        return next();
    }

    res.sendFile(path.resolve("./build/index.html"));
})

app.use(express.static("./build"));

server.listen(config.PORT, "0.0.0.0", () => {
    require("dns").lookup(require("os").hostname(), (err, add, fam) => {
        console.log(add);
    });
    
    console.log("app is listening on port " + config.PORT);
});