const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = class UserService {
  
  static async create({ email, password }) {
    if (email.length <= 6) {
      throw new Error('Invalid email');
    }

    if (password.length < 6) {
      throw new Error('Password must be longer than 6 characters');
    }

    const passwordHash = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );

    const user = await User.insert({
      email,
      passwordHash,
    });

    return user;
  }
};
