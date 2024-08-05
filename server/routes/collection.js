import express from 'express';
import Tag from '../db/models/tag.js';
import Collection from '../db/models/collection.js';
import User from '../db/models/user.js';
import Comment from '../db/models/comment.js';
import Item from '../db/models/item.js';
import checkCurrentUser from './middleware/checkCurrentUser.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

const MAX_COLLECTION_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_ITEM_NAME_LENGTH = 100;
const MAX_ITEM_FIELD_NAME_LENGTH = 75;
const MAX_ITEM_TEXT_VALUE_LENGTH = 255;
const MAX_ITEM_MULTILINE_VALUE_LENGTH = 1000;
const MAX_TAGS_PER_ITEM = 10;
const MAX_TAG_LABEL_LENGTH = 50;
const MAX_TAG_VALUE_LENGTH = 50;

router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find({})
      .populate('user', 'username')
      .populate('items', 'name fields');
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
    const {
      name,
      description,
      category,
      imageUrl,
      user,
      customFieldDefinitions
    } = req.body;

    if (!user) {
      return res.status(403).send({ error: 'operation_forbidden' });
    }
    const passed_user_id = new ObjectId(String(user));

    if (!currentUser.isAdmin && !passed_user_id.equals(currentUser._id)) {
      return res.status(403).send({ error: 'operation_forbidden' });
    }

    if (
      !name ||
      !category ||
      !customFieldDefinitions ||
      customFieldDefinitions.length === 0
    ) {
      return res.status(400).send({ error: 'missing_required_fields' });
    }

    for (const field of customFieldDefinitions) {
      if (!field.name || !field.type) {
        return res.status(400).send({ error: 'missing_custom_fields' });
      }
    }

    if (
      name.length > MAX_COLLECTION_NAME_LENGTH ||
      description.length > MAX_DESCRIPTION_LENGTH
    ) {
      return res.status(400).json({ error: 'invalid_collection_fields' });
    }
    for (const field of customFieldDefinitions) {
      if (field.name.length > MAX_ITEM_FIELD_NAME_LENGTH) {
        return res.status(400).json({ error: 'invalid_custom_fields' });
      }
    }

    const collectionData = {
      name: name,
      description: description,
      imageUrl: imageUrl,
      user: passed_user_id,
      category: category,
      customFieldDefinitions: customFieldDefinitions
    };

    const newCollection = await Collection.create(collectionData);

    await User.findByIdAndUpdate(passed_user_id, {
      $push: { collections: newCollection._id }
    });

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
    const {
      name,
      description,
      category,
      imageUrl,
      user,
      customFieldDefinitions
    } = req.body;

    if (!user) {
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

    if (
      !name ||
      !category ||
      !customFieldDefinitions ||
      customFieldDefinitions.length === 0
    ) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }
    for (const field of customFieldDefinitions) {
      if (!field.name || !field.type) {
        return res.status(400).send({ error: 'missing_custom_fields' });
      }
    }

    if (
      name.length > MAX_COLLECTION_NAME_LENGTH ||
      description.length > MAX_DESCRIPTION_LENGTH
    ) {
      return res.status(400).json({ error: 'invalid_collection_fields' });
    }
    for (const field of customFieldDefinitions) {
      if (field.name.length > MAX_ITEM_FIELD_NAME_LENGTH) {
        return res.status(400).json({ error: 'invalid_custom_fields' });
      }
    }

    collection.name = name;
    collection.description = description;
    collection.imageUrl = imageUrl;
    collection.category = category;
    collection.customFieldDefinitions = customFieldDefinitions;
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
      .populate('items');

    if (!collection) {
      return res.status(404).send({ error: 'collection_not_found' });
    }

    res.status(200).json(collection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'collection_fetch_failed' });
  }
});

router.delete('/:collectionId', checkCurrentUser, async (req, res) => {
  const currentUser = res.locals.user;
  const collectionId = new ObjectId(String(req.params.collectionId));
  const prodUrl = process.env.PROD_URL;

  try {
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ error: 'collection_not_found' });
    }

    if (!currentUser) {
      return res.status(403).json({ error: 'operation_forbidden' });
    }

    if (!collection.user._id.equals(currentUser._id) && !currentUser.isAdmin) {
      return res.status(403).json({ error: 'operation_forbidden' });
    }

    const itemIdsToDelete = collection.items?.map((item) => item._id);

    await Promise.all(
      itemIdsToDelete.map((itemId) =>
        fetch(`${prodUrl}/api/collections/${collectionId}/items/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${
              req.headers.authorization?.split(' ')[1]
            }`
          }
        }).then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to delete item ${itemId}: ${response.statusText}`
            );
          }
        })
      )
    );

    await User.findByIdAndUpdate(collection.user._id, {
      $pull: { collections: collectionId }
    });

    const deletedCollection = await collection.deleteOne();
    res.status(200).json(deletedCollection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'collection_delete_failed' });
  }
});

// Item create
router.post(
  '/:collectionId/items/create',
  checkCurrentUser,
  async (req, res) => {
    const currentUser = res.locals.user;

    try {
      const { name, user, collectionId, fields, tags } = req.body;

      if (!user) {
        return res.status(403).send({ error: 'operation_forbidden' });
      }
      const passed_user_id = new ObjectId(String(user));
      const passed_collection_id = new ObjectId(String(collectionId));

      const passed_collection = await Collection.findById(passed_collection_id);
      if (!passed_collection) {
        return res.status(404).json({ error: 'item_collection_not_found' });
      }

      if (!currentUser.isAdmin && !passed_user_id.equals(currentUser._id)) {
        return res.status(403).send({ error: 'operation_forbidden' });
      }

      if (!name || !fields || fields.length === 0) {
        return res.status(400).send({ error: 'missing_required_fields' });
      }

      if (fields.some((field) => !String(field.value))) {
        return res.status(400).send({ error: 'missing_custom_fields' });
      }

      if (name.length > MAX_ITEM_NAME_LENGTH) {
        return res.status(400).send({ error: 'invalid_item_fields' });
      }

      for (const field of fields) {
        if (
          (field.type === 'text' &&
            field.value.length > MAX_ITEM_TEXT_VALUE_LENGTH) ||
          (field.type === 'multiline_string' &&
            field.value.length > MAX_ITEM_MULTILINE_VALUE_LENGTH)
        ) {
          return res.status(400).send({ error: 'invalid_item_field_values' });
        }
      }

      if (tags.length > MAX_TAGS_PER_ITEM) {
        return res.status(400).json({ error: 'too_many_tags' });
      }
      for (const tag of tags) {
        if (
          tag.label.length > MAX_TAG_LABEL_LENGTH ||
          tag.value.length > MAX_TAG_VALUE_LENGTH
        ) {
          return res.status(400).send({ error: 'invalid_tag_fields' });
        }
      }

      const itemData = {
        name: name,
        collection: passed_collection_id,
        fields: fields
      };

      const newItem = await Item.create(itemData);

      const tagIds = await Promise.all(
        tags.map(async (tag) => {
          let existingTag = await Tag.findOne({ value: tag.value });
          if (!existingTag) {
            existingTag = await Tag.create({
              label: tag.label,
              value: tag.value,
              items: [newItem._id]
            });
          } else {
            await Tag.updateOne(
              { _id: existingTag._id },
              { $push: { items: newItem._id } }
            );
          }
          return existingTag._id;
        })
      );

      await Collection.findByIdAndUpdate(passed_collection_id, {
        $push: { items: newItem._id }
      });

      await Item.updateOne({ _id: newItem._id }, { $set: { tags: tagIds } });

      res.status(201).json(newItem);
    } catch (err) {
      console.error(err.message);
      res.status(500).send({ error: 'item_init_failed' });
    }
  }
);

// Item edit
router.post(
  '/:collectionId/items/:itemId',
  checkCurrentUser,
  async (req, res) => {
    const currentUser = res.locals.user;
    const itemId = new ObjectId(String(req.params.itemId));

    try {
      const { name, user, collectionId, fields, tags } = req.body;

      if (!user) {
        return res.status(403).send({ error: 'operation_forbidden' });
      }
      const passed_user_id = new ObjectId(String(user));
      const passed_collection_id = new ObjectId(String(collectionId));
      if (!currentUser.isAdmin && !passed_user_id.equals(currentUser._id)) {
        return res.status(403).json({ error: 'operation_forbidden' });
      }

      const passed_collection = await Collection.findById(passed_collection_id);
      if (!passed_collection) {
        return res.status(404).json({ error: 'item_collection_not_found' });
      }

      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ error: 'item_not_found' });
      }

      if (!name || !fields || fields.length === 0) {
        return res.status(400).json({ error: 'missing_required_fields' });
      }
      if (fields.some((field) => !String(field.value))) {
        return res.status(400).send({ error: 'missing_custom_fields' });
      }

      if (name.length > MAX_ITEM_NAME_LENGTH) {
        return res.status(400).json({ error: 'invalid_item_fields' });
      }
      for (const field of fields) {
        if (
          (field.type === 'text' &&
            field.value.length > MAX_ITEM_TEXT_VALUE_LENGTH) ||
          (field.type === 'multiline_string' &&
            field.value.length > MAX_ITEM_MULTILINE_VALUE_LENGTH)
        ) {
          return res.status(400).send({ error: 'invalid_item_field_values' });
        }
      }

      if (tags.length > MAX_TAGS_PER_ITEM) {
        return res.status(400).json({ error: 'too_many_tags' });
      }
      for (const tag of tags) {
        if (
          tag.label.length > MAX_TAG_LABEL_LENGTH ||
          tag.value.length > MAX_TAG_VALUE_LENGTH
        ) {
          return res.status(400).send({ error: 'invalid_tag_fields' });
        }
      }

      item.name = name;
      item.fields = fields;
      item.collectionId = passed_collection_id;
      await item.save();

      const existingTagValues = item.tags.map((tag) => tag.value);
      const newTagValues = tags.map((tag) => tag.value);

      const tagsToRemove = existingTagValues.filter(
        (value) => !newTagValues.includes(value)
      );
      for (const tagValue of tagsToRemove) {
        await Tag.updateOne(
          { value: tagValue },
          { $pull: { items: item._id } }
        );
      }

      const updatedTagIds = [];
      for (const tag of tags) {
        let existingTag = await Tag.findOne({ value: tag.value });
        if (!existingTag) {
          existingTag = await Tag.create({
            label: tag.label,
            value: tag.value,
            items: [item._id]
          });
        } else if (!existingTag.items.includes(item._id)) {
          await Tag.updateOne(
            { _id: existingTag._id },
            { $push: { items: item._id } }
          );
        }
        updatedTagIds.push(existingTag._id);
      }

      item.tags = updatedTagIds;
      await item.save();

      res.status(200).json(item);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'item_update_failed' });
    }
  }
);

// Item delete
router.delete(
  '/:collectionId/items/:itemId',
  checkCurrentUser,
  async (req, res) => {
    const currentUser = res.locals.user;
    const itemId = new ObjectId(String(req.params.itemId));
    const collectionId = new ObjectId(String(req.params.collectionId));

    try {
      const item = await Item.findById(itemId);
      const passed_collection = await Collection.findById(collectionId);

      if (!passed_collection) {
        return res.status(404).send({ error: 'item_collection_not_found' });
      }
      if (!item) {
        return res.status(404).json({ error: 'item_not_found' });
      }

      if (!currentUser) {
        return res.status(403).json({ error: 'operation_forbidden' });
      }

      if (
        !passed_collection.user._id.equals(currentUser._id) &&
        !currentUser.isAdmin
      ) {
        return res.status(403).json({ error: 'operation_forbidden' });
      }

      await Comment.deleteMany({ item: itemId });
      await Tag.updateMany({ items: itemId }, { $pull: { items: itemId } });
      await Collection.updateMany(
        { items: itemId },
        { $pull: { items: itemId } }
      );

      const deletedItem = await item.deleteOne();

      res.status(200).json(deletedItem);
    } catch (err) {
      console.error(err.message);
      res.status(500).send({ error: 'item_delete_failed' });
    }
  }
);

// Item get
router.get('/:collectionId/items/:itemId', async (req, res) => {
  try {
    const itemId = new ObjectId(String(req.params.itemId));
    const collectionId = new ObjectId(String(req.params.collectionId));

    const passed_collection = Collection.findById(collectionId);
    const item = await Item.findById(itemId)
      .populate('collection', 'name customFieldDefinitions')
      .populate('tags', 'label value')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username'
        }
      });

    if (!passed_collection) {
      return res.status(404).send({ error: 'item_collection_not_found' });
    }
    if (!item) {
      return res.status(404).send({ error: 'item_not_found' });
    }
    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'item_fetch_failed' });
  }
});

// Item comments
router.post(
  '/:collectionId/items/:itemId/comments',
  checkCurrentUser,
  async (req, res) => {
    const currentUser = res.locals.user;

    try {
      const { text } = req.body;
      const itemId = new ObjectId(String(req.params.itemId));
      const collectionId = new ObjectId(String(req.params.collectionId));

      if (!currentUser) {
        return res.status(403).send({ error: 'operation_forbidden' });
      }

      if (!text) {
        return res.status(400).send({ error: 'empty_comment' });
      }

      const passed_collection = await Collection.findById(collectionId);
      if (!passed_collection) {
        return res.status(404).send({ error: 'item_collection_not_found' });
      }

      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).send({ error: 'comment_item_not_found' });
      }

      const newComment = await Comment.create({
        text,
        author: currentUser._id,
        item: itemId
      });

      item.comments.push(newComment._id);
      await item.save();

      res.status(201).json(await newComment.populate('author', 'username'));
    } catch (err) {
      console.error(err.message);
      res.status(500).send({ error: 'comment_add_failed' });
    }
  }
);

// Item like/unlike
router.post(
  '/:collectionId/items/:itemId/like',
  checkCurrentUser,
  async (req, res) => {
    const currentUser = res.locals.user;

    try {
      if (!currentUser) {
        return res.status(403).send({ error: 'operation_forbidden' });
      }

      const collectionId = new ObjectId(String(req.params.collectionId));
      const itemId = new ObjectId(String(req.params.itemId));
      const item = await Item.findById(itemId);
      const passed_collection = await Collection.findById(collectionId);

      if (!passed_collection) {
        return res.status(404).send({ error: 'item_collection_not_found' });
      }
      if (!item) {
        return res.status(404).send({ error: 'item_not_found' });
      }

      let likeStatus = 'liked';

      if (item.likes.includes(currentUser._id)) {
        await Item.findByIdAndUpdate(
          itemId,
          { $pull: { likes: currentUser._id } },
          { new: true, timestamps: false }
        );
        likeStatus = 'unliked';
      } else {
        await Item.findByIdAndUpdate(
          itemId,
          { $push: { likes: currentUser._id } },
          { new: true, timestamps: false }
        );
      }

      res.status(200).json({ message: likeStatus, item: item });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'item_like_toggle_failed' });
    }
  }
);

export default router;
