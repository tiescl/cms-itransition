import express from 'express';
import Tag from '../db/models/tag.js';
import Collection from '../db/models/collection.js';
import User from '../db/models/user.js';
import Comment from '../db/models/comment.js';
import checkCurrentUser from './middleware/checkCurrentUser.js';
import { ObjectId } from 'mongodb';
const router = express.Router();

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_ITEM_NAME_LENGTH = 50;
const MAX_ITEM_TEXT_VALUE_LENGTH = 255;
const MAX_ITEM_MULTILINE_VALUE_LENGTH = 1000;
const MAX_TAGS_PER_COLLECTION = 10;
const MAX_TAG_LABEL_LENGTH = 50;
const MAX_TAG_VALUE_LENGTH = 50;

router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find({})
      .populate('user', 'username')
      .populate('tags', 'label value')
      .exec();
    res.status(200).send(collections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'collections_fetch_failed' });
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
    if (user === null || user === '') {
      return res.status(403).send({ error: 'operation_forbidden' });
    }
    const passed_user_id = new ObjectId(String(user));

    if (!currentUser.isAdmin && !passed_user_id.equals(currentUser._id)) {
      return res.status(403).send({ error: 'operation_forbidden' });
    }

    if (!name.trim() || !category || !items || items.length === 0) {
      return res.status(400).send({ error: 'missing_required_fields' });
    }

    for (const item of items) {
      if (
        !item.client_id ||
        !item.name.trim() ||
        !item.type ||
        !item.value.trim()
      ) {
        return res.status(400).send({ error: 'missing_item_fields' });
      }
    }

    if (
      name.length > MAX_NAME_LENGTH ||
      description.length > MAX_DESCRIPTION_LENGTH
    ) {
      return res.status(400).json({ error: 'invalid_collection_fields' });
    }
    for (const item of items) {
      if (
        item.name.length > MAX_ITEM_NAME_LENGTH ||
        (item.type === 'text' &&
          item.value.length > MAX_ITEM_TEXT_VALUE_LENGTH) ||
        (item.type === 'multiline_string' &&
          item.value.length > MAX_ITEM_MULTILINE_VALUE_LENGTH)
      ) {
        return res.status(400).json({ error: 'invalid_item_fields' });
      }
    }
    if (tags.length > MAX_TAGS_PER_COLLECTION) {
      return res.status(400).json({ error: 'too_many_tags' });
    }
    for (const tag of tags) {
      if (
        tag.label.length > MAX_TAG_LABEL_LENGTH ||
        tag.value.length > MAX_TAG_VALUE_LENGTH
      ) {
        return res.status(400).json({ error: 'invalid_tag_fields' });
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
    res.status(500).send({ error: 'collection_init_failed' });
  }
});

router.post('/:collectionId', checkCurrentUser, async (req, res) => {
  const currentUser = res.locals.user;
  const collectionId = new ObjectId(String(req.params.collectionId));

  try {
    const { name, description, category, imageUrl, user, items, tags } =
      req.body;

    if (user === null || user === '') {
      return res.status(403).send({ error: 'operation_forbidden' });
    }
    const passed_user_id = new ObjectId(String(user));
    if (!currentUser.isAdmin && !passed_user_id.equals(currentUser._id)) {
      return res.status(403).json({ error: 'operation_forbidden' });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ error: 'collection_not_found' });
    }

    if (!name.trim() || !category || !items || items.length === 0) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }
    for (const item of items) {
      item.name = item.name?.trim();
      item.value = item.value?.trim();
      if (!item.client_id || !item.name || !item.type || !item.value) {
        return res.status(400).send({ error: 'missing_item_fields' });
      }
    }

    if (
      name.length > MAX_NAME_LENGTH ||
      description.length > MAX_DESCRIPTION_LENGTH
    ) {
      return res.status(400).json({ error: 'invalid_collection_fields' });
    }
    for (const item of items) {
      if (
        item.name.length > MAX_ITEM_NAME_LENGTH ||
        (item.type === 'text' &&
          item.value.length > MAX_ITEM_TEXT_VALUE_LENGTH) ||
        (item.type === 'multiline_string' &&
          item.value.length > MAX_ITEM_MULTILINE_VALUE_LENGTH)
      ) {
        return res.status(400).json({ error: 'invalid_item_fields' });
      }
    }
    if (tags.length > MAX_TAGS_PER_COLLECTION) {
      return res.status(400).json({ error: 'too_many_tags' });
    }
    for (const tag of tags) {
      if (
        tag.label.length > MAX_TAG_LABEL_LENGTH ||
        tag.value.length > MAX_TAG_VALUE_LENGTH
      ) {
        return res.status(400).json({ error: 'invalid_tag_fields' });
      }
    }

    collection.name = name.trim();
    collection.description = description.trim();
    collection.imageUrl = imageUrl;
    collection.category = category;
    collection.items = items;
    await collection.save();

    const existingTagValues = collection.tags.map((tag) => tag.value);
    const newTagValues = tags.map((tag) => tag.value);

    const tagsToRemove = existingTagValues.filter(
      (value) => !newTagValues.includes(value)
    );
    for (const tagValue of tagsToRemove) {
      await Tag.updateOne(
        { value: tagValue },
        { $pull: { collections: collection._id } }
      );
    }

    const updatedTagIds = [];
    for (const tag of tags) {
      let existingTag = await Tag.findOne({ value: tag.value });
      if (!existingTag) {
        existingTag = await Tag.create({
          label: tag.label,
          value: tag.value,
          collections: [collection._id]
        });
      } else if (!existingTag.collections.includes(collection._id)) {
        await Tag.updateOne(
          { _id: existingTag._id },
          { $push: { collections: collection._id } }
        );
      }
      updatedTagIds.push(existingTag._id);
    }

    collection.tags = updatedTagIds;
    await collection.save();

    res.status(200).json(collection);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'collection_update_failed' });
  }
});

router.get('/:collectionId', async (req, res) => {
  try {
    const collectionId = new ObjectId(String(req.params.collectionId));

    const collection = await Collection.findById(collectionId)
      .populate('user', 'username')
      .populate('tags', 'label value')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username'
        }
      });

    if (!collection) {
      return res.status(404).send({ error: 'collection_not_found' });
    }
    res.status(200).json(collection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'collection_fetch_failed' });
  }
});

router.post('/:collectionId/comments', checkCurrentUser, async (req, res) => {
  const currentUser = res.locals.user;

  try {
    const { text } = req.body;
    const collectionId = new ObjectId(String(req.params.collectionId));

    if (!currentUser) {
      return res.status(403).send({ error: 'operation_forbidden' });
    }

    if (!text) {
      return res.status(400).send({ error: 'empty_comment' });
    }

    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).send({ error: 'comment_collection_not_found' });
    }

    const newComment = await Comment.create({
      text,
      author: currentUser._id,
      collection: collectionId
    });

    collection.comments.push(newComment._id);
    await collection.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'comment_add_failed' });
  }
});

router.delete('/:collectionId', checkCurrentUser, async (req, res) => {
  const currentUser = res.locals.user;
  const collectionId = new ObjectId(String(req.params.collectionId));

  try {
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ error: 'collection_not_found' });
    }

    if (!currentUser) {
      return res.status(403).json({ error: 'operation_forbidden' });
    }

    if (
      !collection.user._id.equals(currentUser._id) &&
      !res.locals.user.isAdmin
    ) {
      return res.status(403).json({ error: 'operation_forbidden' });
    }

    await Comment.deleteMany({ collection: collectionId });
    await Tag.updateMany(
      { collections: collectionId },
      { $pull: { collections: collectionId } }
    );

    const deletedCollection = await collection.deleteOne();

    res.status(200).json(deletedCollection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'collection_delete_failed' });
  }
});

router.post('/:collectionId/like', checkCurrentUser, async (req, res) => {
  const currentUser = res.locals.user;

  try {
    if (!currentUser) {
      return res.status(403).json({ error: 'operation_forbidden' });
    }

    const collectionId = new ObjectId(String(req.params.collectionId));

    const collection = await Collection.findByIdAndUpdate(
      collectionId,
      { $inc: { likesCount: 1 } },
      { new: true, timestamps: false }
    );

    if (!collection) {
      return res.status(404).json({ error: 'collection_not_found' });
    }
    res.status(200).json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'collection_like_failed' });
  }
});

router.post('/:collectionId/unlike', checkCurrentUser, async (req, res) => {
  const currentUser = res.locals.user;

  try {
    if (!currentUser) {
      return res.status(403).json({ error: 'operation_forbidden' });
    }

    const collectionId = new ObjectId(String(req.params.collectionId));

    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      {
        $inc: { likesCount: -1 }
      },
      { new: true, timestamps: false }
    );

    if (!updatedCollection) {
      return res.status(404).json({ error: 'collection_not_found' });
    }

    if (updatedCollection.likesCount < 0) {
      await Collection.findByIdAndUpdate(collectionId, {
        $set: { likesCount: 0 }
      });
      return res.status(500).json({ error: 'likes_below_zero' });
    }

    res.status(200).json(updatedCollection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'collection_unlike_failed' });
  }
});

export default router;
