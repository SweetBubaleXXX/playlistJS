const path = require("path");
const fs = require("fs");

const express = require("express");

const PORT = process.env.PORT || 3000;
const AUDIO_PATH = path.resolve(process.env.AUDIO_PATH || "./");
const DELIMITER = " - ";

const songFilesInfo = {};

const app = express();

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
