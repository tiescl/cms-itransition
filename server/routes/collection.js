import express from 'express';
import Tag from '../db/models/tag.js';
import Collection from '../db/models/collection.js';
import User from '../db/models/user.js';
import checkCurrentUser from './middleware/checkCurrentUser.js';
import { ObjectId } from 'mongodb';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // get a table view of all collections
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Fetching Collections');
  }
});

router.get('/tags', async (req, res) => {
  try {
    const tags = await Tag.find({}).exec();
    res.status(200).send(tags);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'tags_fetch_failed' });
  }
});

router.post('/create', checkCurrentUser, async (req, res) => {
  const currentUser = res.locals.user;

  try {
    const { name, description, category, imageUrl, user, items, tags } =
      req.body;
    const passed_user_id = new ObjectId(String(user));

    if (!currentUser.isAdmin && !passed_user_id.equals(currentUser._id)) {
      return res.status(403).send('operation_forbidden');
    }

    if (!name || !category || !items || items.length === 0) {
      return res.status(400).send({ error: 'missing_required_fields' });
    }

    for (const item of items) {
      if (!item.client_id || !item.name || !item.type || !item.value) {
        return res.status(400).send({ error: 'missing_item_fields' });
      }
    }

    const collectionData = {
      name: name,
      description: description,
      imageUrl: imageUrl,
      user: passed_user_id,
      category: category,
      items: items
    };

    const newCollection = await Collection.create(collectionData);

    const tagIds = await Promise.all(
      tags.map(async (tag) => {
        let existingTag = await Tag.findOne({ value: tag.value });
        if (!existingTag) {
          existingTag = await Tag.create({
            label: tag.label,
            value: tag.value,
            collections: [newCollection._id]
          });
        } else {
          await Tag.updateOne(
            { _id: existingTag._id },
            { $push: { collections: newCollection._id } }
          );
        }
        return existingTag._id;
      })
    );

    await User.findByIdAndUpdate(passed_user_id, {
      $push: { collections: newCollection._id }
    });

    await Collection.updateOne(
      { _id: newCollection._id },
      { $set: { tags: tagIds } }
    );

    res.status(201).json(newCollection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: err.message });
  }
});

router.get('/:collectionId', async (req, res) => {
  try {
    // fetch a specific collection; auth not required;
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Fetching a Collection');
  }
});

router.post('/:collectionId/comments', async (req, res) => {
  try {
    // add a comment to a collection; auth- and admin-only;
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Adding a Comment');
  }
});

export default router;
