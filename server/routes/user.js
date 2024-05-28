import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../db/models/user.js';
const router = express.Router();

const maxCookieAge = 1 * 24 * 60 * 60;

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // handle user login
    const user = await User.login(email, password);
    const token = createToken(newUser._id, maxCookieAge);
    res.cookie('auth', token, { httpOnly: true, maxAge: maxCookieAge * 1000 });
    res.status(200).send(user._id);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Authenticating the User');
  }
});

router.get('/logout', (req, res) => {
  // handle user logout
  const token = res.cookie('auth', '', { httpOnly: true, maxAge: 1 });
  res.redirect('/');
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // handle user registration
    // you need to handle existing user registration
    // consider implementing the handleErrors function
    const newUser = await User.create({
      username: username,
      email: email,
      password: password
    });

    const token = createToken(newUser._id, maxCookieAge);
    res.cookie('auth', token, { httpOnly: true, maxAge: maxCookieAge * 1000 });
    res.status(201).send(newUser._id);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Registering the User');
  }
});

router.get('/:id', async (req, res) => {
  try {
    // fetch user info for their profile page
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Fetching User Data');
  }
});

router.put('/:id', async (req, res) => {
  try {
    // update user info; done by either the admin or the user
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Updating User Info');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // delete the user; admin-only;
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Deleting User Info');
  }
});

const createToken = (id, duration) => {
  return jwt.sign({ id }, process.env.SECRET_JWT_KEY, { expiresIn: duration });
};
