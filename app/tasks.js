const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const checkAttach = require("../middleware/checkAttach");
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const createRouter = () => {
    router.post("/", auth, async (req, res) => {
        try {

            let task = {
                user: req.user,
                title: req.body.title,
                description: req.body.description,
                status: req.body.status
            }

            task = new Task(task);
            await task.save();
            return res.send(task);
        }
        catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    });

    router.get("/", auth, async (req, res) => {
        try {

            let tasks = await Task.find({ "user": req.user.id });
            res.send(tasks);
        } catch (e) {
            console.error(e.message)
            res.sendStatus(500).send(e);
        }
    });

    router.delete("/:id", auth, checkAttach, async (req, res) => {
        try {
            let deletedTask = await Task.deleteOne(req.task);
            res.send({ "message": "Task deleted", deletedTask });
        } catch (e) {
            console.error(e.message)
            res.sendStatus(500).send(e);
        }
    });

    router.put("/:id", auth, checkAttach, async (req, res) => {
        try {
            let editedTask = {
                title: req.body.title,
                description: req.body.description,
                status: req.body.status
            }

            let updatedTask = await Task.findByIdAndUpdate(req.task.id, { $set: editedTask }, { runValidators: true, new: true });

            res.send({ "message": "Task edited", updatedTask });
        } catch (e) {
            console.error(e.message)
            res.sendStatus(500).send(e);
        }
    });


    return router;
};


module.exports = createRouter;