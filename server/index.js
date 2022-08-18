const path = require("path");
const http = require("http");
const config = require("./config");
const express = require("express");
const {Server:IoServer} = require("socket.io");
const cookie_parser = require("cookie-parser")
const express_session = require("express-session")
const { get_file_extension } = require("./functions/utils");
const mongoStore = require("connect-mongo");
const {createAdapter:createSocketIoMongoAdapter} = require("@socket.io/mongo-adapter")
const { DB_NAME, SOCKET_IO_DB_NAME } = require("./config");

const db_init = require("./database/init");
const { SOCKET_ROOM_ADMINS, SOCKET_ROOM_SALES, SOCKET_ROOM_STUDENTS, SOCKET_ROOM_TEACHERS, SOCKET_ROOM_USERS } = require("./socket_rooms");
const { SOCKET_EVENT_LOGIN, SOCKET_EVENT_LOGOUT } = require("./socket_events");
const db = db_init();

require("./database/schemas/users");
require("./database/schemas/scores");
require("./database/schemas/config");
require("./database/schemas/classes");
require("./database/schemas/invoices");
require("./database/schemas/requests");
require("./database/schemas/schedule");
require("./database/schemas/sessions");
require("./database/schemas/purchases");
require("./database/schemas/attendance");
require("./database/schemas/attachments");
require("./database/schemas/assignments");
require("./database/schemas/submissions");
require("./database/schemas/withdrawals");
require("./database/schemas/reschedules");
require("./database/schemas/announcements");
require("./database/schemas/notifications");

const app = express();
const server = http.createServer(app);
const mongoClient = db.getClient();

const io = new IoServer(server, {
    pingTimeout: 10000,
    pingInterval: 2500,
    transports: ["websocket"]
});

const roomMap = {
    sales: SOCKET_ROOM_SALES,
    admin: SOCKET_ROOM_ADMINS,
    teacher: SOCKET_ROOM_TEACHERS,
    student: SOCKET_ROOM_STUDENTS
}

io.on("connection", (socket) => {
    // console.log("socket connected ⚡⚡⚡ ", socket.id);
    // socket.join(SOCKET_ROOM_USERS);

    socket.on(SOCKET_EVENT_LOGIN, (user) => {
        // console.log(user);
        socket.join([user._id, user.email, roomMap[user.type]]);
        // console.log(socket.rooms)
    });

    socket.on(SOCKET_EVENT_LOGOUT, () => {
        for(const room of socket.rooms){
            if(room !== socket.id){
                socket.leave(room);
            }
        }
    });
})

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Access-Control-Allow-Credentials", "true");
    // console.log("cors");
    // console.log(req.headers.origin);
    next();
}

app.use(allowCrossDomain);

app.use((req, res, next) => {
    req.socket_io = io;

    next()
});

app.use("/api", express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookie_parser());

app.use(express_session({
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
    },
    store: mongoStore.create({client: mongoClient, collectionName: "sessions"}), /// should use mongostore in future
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
require("./routes/stripe_routes")(app);
require("./routes/config_routes")(app);
require("./routes/session_routes")(app);
require("./routes/assignment_routes")(app);
require("./routes/reschedule_routes")(app);
require("./routes/announcement_routes")(app);
require("./routes/notification_routes")(app);

app.get("*", async(req, res, next) => {
    const url_path = req.url.split("?")[0];

    if(((url_path.split(".").length > 1) && /(html|webp|jpeg|png|jpg|gif|xml|mp4|mp3|js|json|txt|ico|svg|map|css|ttf|otf)/ig.test(get_file_extension(url_path))) || (url_path.indexOf("apple-developer-merchantid-domain-association") !== -1)){
        return next();
    }

    res.sendFile(path.resolve("./build/index.html"));
})

app.use(express.static("./build"));
app.use("/uploads", express.static("./uploads"));

(async () => {
    try{
        await mongoClient.db(DB_NAME).createCollection(SOCKET_IO_DB_NAME, {capped: true, size: 1e6})
    }catch(e){
        console.log("Collection may already exist", e.message);
    }

    const socketIoMongoAdapterCollection = mongoClient.db(DB_NAME).collection(SOCKET_IO_DB_NAME);
    
    io.adapter(createSocketIoMongoAdapter(socketIoMongoAdapterCollection, {}));

    server.listen(config.PORT, "0.0.0.0", () => {
        require("dns").lookup(require("os").hostname(), (err, add, fam) => {
            console.log(add);
        });
        
        console.log("app is listening on port " + config.PORT);
    });
})()