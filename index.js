#!/usr/bin/env node

const inquirer = require('inquirer');
const mongoose = require('mongoose');
const chalk = require('chalk');
const { connectToMongoDB, closeMongoDBConnection } = require('./mongo.js');
const { hashPassword, verifyPassword } = require('./passwordUtils.js');
const { createTask, viewTask, editTask, deleteTask } = require('./taskFunctions')
const User = require('./userSchema.js');

const uri = 'mongodb://localhost:27017/task-manager-db';

// Encapsulate the main logic in an async function
async function main() {
  const db = await connectToMongoDB();

  const options = [
    { name: 'Login', value: 'login' },
    { name: 'Register', value: 'register' },
  ];

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'userOption',
      message: 'Task-Manager-CLI',
      choices: options.map((option) => option.name),
    }
  ]);

  if (answers.userOption === 'Login') {
    await login(db);
  } else {
    await register();
  }
}

async function validate(db, answers) {
  const collection = db.collection('users');
  const query = {};
  const cursor = collection.find(query);

  await cursor.forEach(async (user) => {
    try {
      const verifyPass = await verifyPassword(answers.password, user.password);

      if (user.username === answers.username && verifyPass === true) {
        console.log('Login successful for user:', user.username);
        console.clear();
        taskOptions(user.username);
      }
    } catch (error) {
      console.error('Error verifying password:', error);
    }
  });

  await closeMongoDBConnection(db);
}

async function login(db) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Enter username:',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter password:',
      mask: '*',
    },
  ]);


  await validate(db, answers);
}

async function register() {
  const regUser = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Enter username:',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter password:',
      mask: '*',
    },
  ]);
  current_user = regUser.username.toLowerCase();
  const hashedPass = await hashPassword(regUser.password);
  console.log(`Welcome ${regUser.username.toLowerCase()}!`);
  createUser(regUser.username, hashedPass);
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
      // console.log(currentUser)
      createTask(currentUser)
      break;
    case 'View Task':
      viewTask(currentUser)

      break;
    case 'Edit Task':
      editTask(currentUser);

      break;
    case 'Delete Task':
      deleteTask(currentUser)


      break;

    default:
      console.log('Invalid choice');
      break;
  }
}

async function createUser(newUserName, newPassword) {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    let newUser = await User.findOne({ newUserName });

    if (!newUser) {
      newUser = new User({
        username: newUserName,
        password: newPassword,
      });
      await newUser.save();
      console.log('user saved successfully');
    }
  } catch (error) {
    console.log(error);
  } finally {
    await mongoose.disconnect();
    console.log('disconnected from server');
  }
}

// Execute the main function
main().catch((error) => {
  console.error(error);
});

