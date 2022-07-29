const crypto = require("crypto");

function hash(password, salt) {
    salt = salt || crypto.randomBytes(16).toString("hex");
    return crypto.createHmac("sha256", salt).update(password).digest("hex") + salt;
}

function validate(password, hashedPass) {
    return hashedPass == hash(password, hashedPass.slice(-32));
}

module.exports.hash = hash;

module.exports.validate = validate;

if (typeof require !== 'undefined' && require.main === module) {
    if (!process.argv[2]) {
        throw "No argument";
    }
    console.log(hash(process.argv[2]));
}