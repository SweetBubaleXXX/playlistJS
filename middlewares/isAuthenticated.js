module.exports = function(req, res, next) {
    if (!req.session.authenticated) {
        return res.sendStatus(403);
    }
    next();
}