const Task = require("../models/Task");

const checkAttach = async (req, res, next) => {
    let task = await Task.findById(req.params.id);
    if (!task) {
        return res.status(400).send({ error: 'Incorrect task id' });
    }

    if (task.user != req.user.id) {
        return res.status(400).send({ error: 'Current user has no permissions to change this task' });
    }

    req.task = task;
    next();
}

module.exports = checkAttach;