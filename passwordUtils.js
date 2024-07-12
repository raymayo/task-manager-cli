const bcrypt = require('bcrypt');

const saltRounds = 10;

const hashPassword = async (plainPassword) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plainPassword, salt);
    return hash;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const verifyPassword = async (plainPassword, hash) => {
  try {
    const match = await bcrypt.compare(plainPassword, hash);
    return match;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = { hashPassword, verifyPassword };
