const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const multer = require('multer');
const path = require('path');
const config = require('../config');
const User = require("../models/User");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, nanoid() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const createRouter = () => {
    router.post("/", upload.single('avatar'), async (req, res) => {
        let result = await User.findOne({ username: req.body.username })
        if (result) {
            return res.send(result);
        }

        const user = { ...req.body };
        if (req.file) {
            user.avatar = req.file.filename;
        }

        result = new User(user);
        result.generateToken();
        try {
            await result.save();
            res.send(result);
        } catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    });

    router.post("/sessions", async (req, res) => {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).send({ error: 'Username not found' });
        }

        const passwordCorrect = await user.checkPassword(req.body.password, user.password);

        if (!passwordCorrect) {
            return res.status(400).send({ error: 'Password is wrong' });
        }

        user.generateToken();

        try {
            await user.save();
            return res.send(user);

        } catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    });

    return router;
};


module.exports = createRouter;