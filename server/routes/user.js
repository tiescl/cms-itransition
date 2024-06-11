import express from 'express';
import User from '../db/models/user.js';
import checkCurrentUser from './middleware/checkCurrentUser.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get('/:userId', async (req, res) => {
  const userId = new ObjectId(String(req.params.userId));

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).send({ error: 'user_not_found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'user_fetch_failed' });
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
