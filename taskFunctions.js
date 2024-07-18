const inquirer = require('inquirer');
const mongoose = require('mongoose');
const User = require('./userSchema.js');
const chalk = require('chalk');

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
            console.clear();
            console.log(chalk.bgGreen('Task saved successfully'));
        } else {
            console.log('User not found or task not added');
        }
    } catch (error) {
        console.log(error);
    } finally {
        await mongoose.disconnect();
        taskOptions(currentUser);
    }
}

// TODO: add features
async function viewTask(currentUser) {
    await mongoose.connect(uri);

    try {
        const user = await User.findOne({ username: currentUser });

        if (user) {
            const taskList = user.taskList;

            let viewAllTask = [];
            taskList.forEach((task, index) => {
                viewAllTask.push({
                    name: `Task ${index + 1}: ${task.task}`,
                    value: task.task,
                })
            })

            viewAllTask.push({ name: 'Back', value: 'goBack' });

            const viewTask = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'allTask',
                    message: 'Edit Task',
                    choices: viewAllTask,
                },
            ]);

            if (viewTask.allTask === 'goBack') {
                console.clear();
                taskOptions(currentUser);
            }

        }
    } catch (error) {
        console.error(error);
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

            taskChoices.push({ name: 'Back', value: 'goBack' });

            const editTaskView = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'allTask',
                    message: 'Edit Task',
                    choices: taskChoices,
                },
            ]);

            if (editTaskView.allTask === 'goBack') {
                console.clear();
                taskOptions(currentUser);
            } else {
                const confirmation = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'dialogue',
                        message: 'Do you want to edit this item?',
                        choices: ['Yes', 'No'],
                    },
                ]);
                if (confirmation.dialogue === 'Yes') {
                    replaceTask(editTaskView.allTask, currentUser);
                } else {
                    console.clear();
                    editTask(currentUser);
                }
            }
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
                default: task,
            },
        ]);

        // Connect to the database
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Find the user by username
        const user = await User.findOne({ username: currentUser });

        if (!user) {
            console.log('User not found');
            return;
        }

        // Find the task in the user's task list
        const selectedTask = user.taskList.find(
            (taskItem) => taskItem.task === task
        );

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
            console.clear();
            console.log(chalk.bgGreen('Task replaced successfully'));
        } else {
            console.log('Task not updated');
        }
    } catch (error) {
        console.error('Error replacing task:', error);
    } finally {
        // Ensure the database connection is closed
        await mongoose.disconnect();
        taskOptions(currentUser);
    }
}

async function removeFunc(task, currentUser) {
    try {
        // Connect to the database
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Find the user by username
        const user = await User.findOne({ username: currentUser });

        if (!user) {
            console.log('User not found');
            return;
        }

        // Find the task in the user's task list
        const selectedTask = user.taskList.find(
            (taskItem) => taskItem.task === task
        );

        if (!selectedTask) {
            console.log(chalk.red('Task not found'));
            return;
        }

        // Update the task in the user's task list
        const updatedUser = await User.findOneAndUpdate(
            { username: currentUser },
            { $pull: { taskList: { _id: selectedTask._id } } },
            { new: true }
        );

        if (updatedUser) {
            console.clear();
            console.log(chalk.bgGreen('Task deleted successfully'));
        } else {
            console.log('Task not updated');
        }
    } catch (error) {
        console.error('Error replacing task:', error);
    } finally {
        // Ensure the database connection is closed
        await mongoose.disconnect();
        taskOptions(currentUser);
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

            // TODO: add a go back to choices

            const taskChoice = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'allTask',
                    message: 'Delete Task',
                    choices: taskChoices,
                },
            ]);

            const confirmation = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'dialogue',
                    message: 'Do you want to delete this item?',
                    choices: ['Yes', 'No'],
                },
            ]);
            if (confirmation.dialogue === 'Yes') {
                removeFunc(taskChoice.allTask, currentUser);
            } else {
                console.clear();
                deleteTask(currentUser);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function taskOptions(currentUser) {
    const menuData = await inquirer.prompt([
        {
            type: 'list',
            name: 'taskOption',
            message: 'Task Menu',
            choices: ['Create Task', 'View Task', 'Edit Task', 'Delete Task'],
        },
    ]);
    switch (menuData.taskOption) {
        case 'Create Task':
            createTask(currentUser);
            break;
        case 'View Task':
            viewTask(currentUser);
            break;
        case 'Edit Task':
            editTask(currentUser);

            break;
        case 'Delete Task':
            deleteTask(currentUser);

            break;

        default:
            console.log('Invalid choice');
            break;
    }
}

module.exports = { createTask, viewTask, editTask, deleteTask, taskOptions };
