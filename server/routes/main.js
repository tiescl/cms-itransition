import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../db/models/user.js';
const router = express.Router();

const maxCookieAge = 1 * 24 * 60 * 60;

router.get('/', async (req, res) => {
  try {
    // fetch top 5 collections (with most likes) and 5 largest collections
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error fetching collections');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // handle user login
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('auth', token, { httpOnly: true, maxAge: maxCookieAge * 1000 });
    res.status(200).send(user._id);
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ error: err.message });
  }
});

router.get('/logout', (req, res) => {
  // handle user logout
  const token = res.cookie('auth', '', { httpOnly: true, maxAge: 1 });
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // handle user registration
    // consider implementing the handleErrors function
    const userExists = await User.exists({ email: email });
    if (userExists) {
      return res.status(400).send({ error: 'email_in_use' });
    }
    const newUser = await User.create({
      username: username,
      email: email,
      password: await hashPassword(password)
    });

    const token = createToken(newUser._id);
    res.cookie('auth', token, { httpOnly: true, maxAge: maxCookieAge * 1000 });
    res.status(201).send(newUser._id);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('internal_server_error');
  }
});

const hashPassword = async (password) => {
  let salt = await bcrypt.genSalt(10);
  let hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_JWT_KEY, {
    expiresIn: maxCookieAge
  });
};

export default router;
