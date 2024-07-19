#!/usr/bin/env node

import inquirer from 'inquirer';
import mongoose from 'mongoose';
import figlet from 'figlet';
import { connectToMongoDB, closeMongoDBConnection } from './mongo.mjs';
import { hashPassword, verifyPassword } from './passwordUtils.mjs';
import { taskOptions } from './taskFunctions.mjs';
import chalkAnimation from 'chalk-animation';
import gradient from 'gradient-string';

import User from './userSchema.mjs';

const uri = 'mongodb://localhost:27017/task-manager-db';

const title = figlet.textSync('Task Manager CLI', {
  font: 'Standard', // You can change the font style
  horizontalLayout: 'default',
  verticalLayout: 'default'
});

const animation = chalkAnimation.rainbow(title);
const gradientTitle = gradient(['#FFEA00', '#E5194C', '#0D0066'])(title);


// Encapsulate the main logic in an async function
async function main() {
  console.clear()
  console.log(gradientTitle);
  const db = await connectToMongoDB();

  const options = [
    { name: 'Login', value: 'login' },
    { name: 'Register', value: 'register' },
  ];

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'userOption',
      message: 'Welcome!',
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




