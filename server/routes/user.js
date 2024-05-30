import express from 'express';
import User from '../db/models/user.js';
import requireAuth from './middleware/requireAuth.js';
const router = express.Router();

router.get('/', async (req, res) => {
  // return a list of all users
  const users = await User.find({}).exec();
  res.status(200).send(users);
  try {
  } catch (err) {
    res.status(500).send({ error: err.message });
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

export default router;
