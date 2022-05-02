const get_user = require("../middleware/get_user");

const router = require("express").Router();

module.exports = (app) => {
    router.route("/login/check").get(get_user, async (req, res) => {
        const {user} = req;

        res.json({user: user, logged_in: !!user, success: true});
    })

    app.use("/api/auth", router)
}