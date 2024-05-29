import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../db/models/user.js';
import requireAuth from './middleware/requireAuth.js';
const router = express.Router();

const maxCookieAge = 1 * 24 * 60 * 60;

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // handle user login
    const user = await User.login(email, password);
    setCookie(user._id);
    res.status(200).send(user._id);
  } catch (err) {
    console.error(err.message);
    res.status(400).send('Error Authenticating the User');
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

    setCookie(newUser._id);
    res.status(201).send(newUser._id);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Registering the User');
  }
});

router.get('/:id', async (req, res) => {
  // conditionally render additional functionality
  // if checkCurrentUser returns the same user
  const userId = req.params.id;

  try {
    // fetch user info for their profile page
    const user = await User.findById(userId).exec();
    if (!user) {
      res.status(404).send('User Not Found');
    }
    res.status(200).send(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Fetching User Data');
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const userId = req.params.id;
  const currentUser = res.locals.user;

  try {
    // update user info; admin-only;
    const user = await User.findById(userId).exec();
    if (!user) {
      res.status(404).send('User Not Found');
    }
    if (!currentUser.isAdmin) {
      res.status(403).send('User Info Modification is for Admins-Only');
    }
    const updatedUser = await user.updateOne(req.body, { new: true });
    console.log(updatedUser);
    res.status(200).send('User Update Successful');
  } catch (err) {
    console.error(err.message);
    res.status(400).send('Error Updating User Info');
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const userId = req.params.id;
  const currentUser = res.locals.user;

  try {
    // delete the user; admin-only;
    const user = await User.findById(userId).exec();
    if (!user) {
      res.status(404).send('User Not Found');
    }
    if (!currentUser.isAdmin) {
      res.status(403).send('User Deletion is for Admins-Only');
    }
    const deletedUser = await user.deleteOne();
    res.status(200).send('User Deletion Successful');
    console.log(deletedUser);
  } catch (err) {
    console.error(err.message);
    res.status(400).send('Error Deleting User Info');
  }
});

const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_JWT_KEY, {
    expiresIn: maxCookieAge
  });
};

const setCookie = (id) => {
  const token = createToken(id);
  res.cookie('auth', token, { httpOnly: true, maxAge: maxCookieAge * 1000 });
};
