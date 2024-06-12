import express from 'express';
import User from '../db/models/user.js';
import Collection from '../db/models/collection.js';
import jira from '../jira.js';
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

router.get('/:userId/tickets', checkCurrentUser, async (req, res) => {
  const currentUser = res.locals.user;
  const userId = new ObjectId(String(req.params.userId));

  try {
    const startAt = req.query.startAt || 0;
    const maxResults = 10;

    if (!currentUser) {
      return res.status(403).send('operation_forbidden');
    }
    if (!currentUser.isAdmin && !userId.equals(currentUser._id)) {
      return res.status(403).send('operation_forbidden');
    }

    const user = await jira.searchUsers({
      query: currentUser.email
    });
    const userExists = user?.length > 0 || false;

    if (!userExists) {
      return res.status(404).send({ error: 'jira_user_not_found' });
    }
    let reporterAccountId = user[0].accountId;

    const jql = `'Reported By' = "${reporterAccountId}" ORDER BY created DESC`;
    const results = await jira.searchJira(jql, {
      startAt,
      maxResults,
      fields: ['summary', 'status', 'priority']
    });

    const issues = results.issues.map((issue) => ({
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status.name,
      priority: issue.fields.priority.name
    }));

    res.json({
      issues: issues,
      total: results.total,
      startAt: startAt + maxResults
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'tickets_fetch_failed' });
  }
});

router.get('/:userId', async (req, res) => {
  const userId = new ObjectId(String(req.params.userId));

  try {
    const user = await User.findById(userId).populate({
      path: 'collections',
      populate: {
        path: 'items',
        select: 'name fields'
      }
    });

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

  const prodUrl = process.env.PROD_URL;

  try {
    // delete the user; admin-only;
    const { selectedUsers } = req.body;

    if (!currentUser.isAdmin) {
      res.status(403).send('operation_forbidden');
    }

    if (selectedUsers.length === 0) {
      return res.status(200).send('update_successful');
    }

    const users = await User.find({ email: { $in: selectedUsers } });
    const collectionIdsToDelete = users.flatMap((user) => user.collections);

    const deleteResult = await User.deleteMany({
      email: { $in: selectedUsers }
    });

    if (deleteResult.deletedCount > 0) {
      res.status(200).send({
        message: `${deleteResult.deletedCount} users deleted successfully.`
      });
    } else {
      return res.status(404).send({ error: 'no_users_found' });
    }

    for (const collectionId of collectionIdsToDelete) {
      try {
        const response = await fetch(
          `${prodUrl}/api/collections/${collectionId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${
                req.headers.authorization?.split(' ')[1]
              }`
            }
          }
        );

        if (!response.ok) {
          console.error(
            `Error deleting collection ${collectionId}:`,
            response.statusText
          );
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (error) {
        console.error(`Error deleting collection ${collectionId}:`, error);
        throw error;
      }
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.delete('/:userId', checkCurrentUser, async (req, res) => {
  const currentUser = res.locals.user;
  const userId = new ObjectId(String(req.params.userId));
  const prodUrl = process.env.PROD_URL;

  try {
    if (!currentUser.isAdmin && !userId.equals(currentUser._id)) {
      return res.status(403).send('operation_forbidden');
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('user_not_found');
    }

    const collectionIdsToDelete = user.collections?.map(
      (collection) => collection._id
    );

    for (const collectionId of collectionIdsToDelete) {
      try {
        const response = await fetch(
          `${prodUrl}/api/collections/${collectionId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${
                req.headers.authorization?.split(' ')[1]
              }`
            }
          }
        );

        if (!response.ok) {
          console.error(
            `Error deleting collection ${collectionId}:`,
            response.statusText
          );
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (error) {
        console.error(`Error deleting collection ${collectionId}:`, error);
        throw error;
      }
    }

    const deleteResult = await User.deleteOne({ _id: userId });

    if (deleteResult.deletedCount > 0) {
      res.status(200).json({ deleteResult });
    } else {
      res.status(404).send({ error: 'user_not_found' });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

export default router;
