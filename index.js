const path = require("path");
const fs = require("fs");

require("dotenv").config();
const express = require("express");
const session = require("express-session");

const isAuthenticated = require("./middlewares/isAuthenticated");
const { validate } = require("./pass");

const PORT = process.env.PORT || 3000;
const AUDIO_PATH = path.resolve(process.env.AUDIO_PATH || "./");
const DELIMITER = " - ";

const songFilesInfo = {};

const app = express();

app.use(express.text());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    maxAge: 1000 * 60 * 60 * 48
}));
app.use("/playlist", isAuthenticated);

app.get("/", (req, res) => {
    if (!req.session.authenticated) {
        return res.sendFile(path.join(__dirname, "views/prompt.html"));
    }
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.use(express.static(path.join(__dirname, "public")));

app.post("/", (req, res) => {
    req.session.authenticated = validate(req.body, process.env.PASSWORD);
    res.redirect("/");
});

app.get("/playlist", (req, res) => {
    const files = fs.readdirSync(AUDIO_PATH);
    if (files.length === 0)
        return res.sendStatus(404);
    if (Object.keys(songFilesInfo).length === files.length) {
        return res.send(songFilesInfo);
    }
    files.forEach((file, index) => {
        if (path.extname(file) !== ".mp3") {
            if (index === files.length - 1)
                res.sendStatus(404);
            return;
        }
        let splited_filename = path.parse(file).name.split(DELIMITER);
        let artist = splited_filename.length > 1 && splited_filename[0] || "Unknown";
        let title = splited_filename.length > 1 && splited_filename.slice(1).join(DELIMITER) || splited_filename.join();
        songFilesInfo[file] = {
            artist,
            title,
            path: encodeURIComponent(file)
        };
        if (index === files.length - 1)
            res.send(songFilesInfo);
    });
});

app.get("/playlist/:file", (req, res) => {
    res.sendFile(path.join(AUDIO_PATH, decodeURIComponent(req.params.file)));
});

app.listen(PORT, () => {
    console.log(`Running on PORT - ${PORT}`);
});
