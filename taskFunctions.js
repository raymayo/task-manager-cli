const inquirer = require('inquirer');
const mongoose = require('mongoose');
const User = require('./userSchema.js');
const chalk = require('chalk');
const taskOptions = require('./index.js');


const uri = 'mongodb://localhost:27017/task-manager-db';

async function createTask(currentUser) {
    console.log('Create Task');

    const createTaskPrompt = await inquirer.prompt([
        {
            type: 'input',
            name: 'task',
            message: 'Enter Task:',
        },
    ]);

    try {
        await mongoose.connect(uri);
        let newTask = await User.findOne({ currentUser });

        newTask = await User.findOneAndUpdate(
            { username: currentUser },
            {
                $push: {
                    taskList: {
                        task: createTaskPrompt.task,
                        completed: false,
                        createdAt: new Date(),
                    },
                },
            },
            { new: true }
        );

        if (newTask) {
            console.log('Task saved successfully');
        } else {
            console.log('User not found or task not added');
        }
    } catch (error) {
        console.log(error);
    } finally {
        await mongoose.disconnect();
    }
}

async function viewTask(currentUser) {
    await mongoose.connect(uri);

    try {
        const user = await User.findOne({ username: currentUser });

        if (user) {
            const taskList = user.taskList;

            taskList.forEach((task, index) => {
                console.log(chalk.cyan(`Task ${index + 1}:`), task.task);
                console.log();
            });
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

async function editTask(currentUser) {
    await mongoose.connect(uri);

    try {
        const user = await User.findOne({ username: currentUser });

        if (user) {
            let taskList = user.taskList;
            let taskChoices = [];
            taskList.forEach((task, index) => {
                taskChoices.push({
                    name: `Task ${index + 1}: ${task.task}`,
                    value: task.task,
                });
            });

            await inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'allTask',
                        message: 'Edit Task',
                        choices: taskChoices,
                    },
                ])
                .then((answers) => {
                    // console.log(answers.allTask);
                    replaceTask(answers.allTask, currentUser)


                });
        }
    } catch (err) {
        console.log(err);
    }
}

async function replaceTask(task, currentUser) {
    try {
        // Prompt user for the new task
        const { task: newTask } = await inquirer.prompt([
            {
                type: 'input',
                name: 'task',
                message: 'Replace Task:',
                default: task
            },
        ]);

        // Connect to the database
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        // Find the user by username
        const user = await User.findOne({ username: currentUser });

        if (!user) {
            console.log('User not found');
            return;
        }

        // Find the task in the user's task list
        const selectedTask = user.taskList.find(taskItem => taskItem.task === task);

        if (!selectedTask) {
            console.log(chalk.red('Task not found'));
            return;
        }

        // Update the task in the user's task list
        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id, 'taskList._id': selectedTask._id },
            { $set: { 'taskList.$.task': newTask } },
            { new: true }
        );

        if (updatedUser) {
            console.log(chalk.green('Task replaced successfully'));
            taskOptions(currentUser)
        } else {
            console.log('Task not updated');
        }
    } catch (error) {
        console.error('Error replacing task:', error);
    } finally {
        // Ensure the database connection is closed
        await mongoose.disconnect();
    }
}

async function deleteTask(currentUser) {
    await mongoose.connect(uri);

    try {
        const user = await User.findOne({ username: currentUser });

        if (user) {
            let taskList = user.taskList;
            let taskChoices = [];
            taskList.forEach((task, index) => {
                taskChoices.push({
                    name: `Task ${index + 1}: ${task.task}`,
                    value: task.task,
                });
            });

            await inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'allTask',
                        message: 'Edit Task',
                        choices: taskChoices,
                    },
                ])
                .then((answers) => {
                    // console.log(answers.allTask);



                });
        }
    } catch (err) {
        console.log(err);
    }
}


module.exports = { createTask, viewTask, editTask };
