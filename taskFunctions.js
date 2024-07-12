const inquirer = require('inquirer');
const mongoose = require('mongoose');
const User = require('./userSchema.js');
const chalk = require('chalk');

const uri = 'mongodb://localhost:27017/task-manager-db';

async function createTask(currentUser) {

    console.log('Create Task')

    const createTaskPrompt = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter Title:',
        },
        {
            type: 'input',
            name: 'description',
            message: 'Enter Description:',
        },
    ]);

    try {

        await mongoose.connect(uri);
        let newTask = await User.findOne({ currentUser });

        if (!currentUser) {
            console.log('user not found')
        }

        newTask = await User.findOneAndUpdate(
            { username: currentUser },
            {
                $push: {
                    task: {
                        title: createTaskPrompt.title,
                        description: createTaskPrompt.description,
                        completed: false,
                        createdAt: new Date()
                    },
                }
            },
            { new: true }
        );

        if (newTask) {
            console.log('Task saved successfully');
        } else {
            console.log('User not found or task not added');
        }


    } catch (error) {
        console.log(error)
    } finally {
        await mongoose.disconnect();
    }

}


async function viewTask(currentUser) {
    await mongoose.connect(uri);

    try {
        const user = await User.findOne({ username: currentUser })

        if (user) {
            const taskList = user.task;

            // let taskArray = []
            // taskList.forEach((task, index) => { taskArray.push(`Task ${index + 1}`) })


            // const displayTask = await inquirer.prompt([
            //     {
            //         type: 'list',
            //         name: 'allTask',
            //         message: 'Task List:',
            //         choices: taskArray.map((option) => option),
            //     }
            // ]);

            // taskList.forEach((task, index) => { `Task ${index + 1}:` })

            taskList.forEach((task, index) => {
                console.log(chalk.green(`Task ${index + 1}`));
                console.log(chalk.cyan(`Title:`), task.title);
                console.log(chalk.cyan(`Desc:`), task.description);
                console.log();
            });
        }
    } catch (error) {
        console.error(error)
    }
}

module.exports = { createTask, viewTask };
