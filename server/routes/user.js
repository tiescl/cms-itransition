import express from 'express';
import User from '../db/models/user.js';
import checkCurrentUser from './middleware/checkCurrentUser.js';
const router = express.Router();

router.get('/', async (req, res) => {
  // return a list of all users
  try {
    const users = await User.find({}).exec();
    res.status(200).send(users);
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

router.post('/', checkCurrentUser, async (req, res) => {
  const currentUser = res.locals.user;

  try {
    // update user info; admin-only;
    const { selectedUsers, property, value } = req.body;

    if (!currentUser.isAdmin) {
      res.status(403).send('operation_forbidden');
    }

    if (selectedUsers.length === 0) {
      return res.status(200).send('update_successful');
    }

    const updateObject = { $set: {} };
    updateObject.$set[property] = value;

    const updatedUsers = await User.updateMany(
      { email: { $in: selectedUsers } },
      updateObject
    );

    res.status(200).send(updatedUsers);
  } catch (err) {
    console.error(err.message);
    res.status(400).send('Error Updating User Info');
  }
});

router.delete('/', checkCurrentUser, async (req, res) => {
  const currentUser = res.locals.user;

  try {
    // delete the user; admin-only;
    const { selectedUsers } = req.body;

    if (!currentUser.isAdmin) {
      res.status(403).send('operation_forbidden');
    }

    if (selectedUsers.length === 0) {
      return res.status(200).send('update_successful');
    }

    const deleteResult = await User.deleteMany({
      email: { $in: selectedUsers }
    });

    if (deleteResult.deletedCount > 0) {
      res.status(200).send({
        message: `${deleteResult.deletedCount} users deleted successfully.`
      });
    } else {
      res.status(404).send({ error: 'no_users_found' });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

export default router;
