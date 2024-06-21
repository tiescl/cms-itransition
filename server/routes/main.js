import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jira from '../jira.js';

import User from '../db/models/user.js';
import Item from '../db/models/item.js';
import Tag from '../db/models/tag.js';
import Comment from '../db/models/comment.js';
import Collection from '../db/models/collection.js';
import checkCurrentUser from './middleware/checkCurrentUser.js';

const router = express.Router();

const maxCookieAge = 1 * 24 * 60 * 60;

router.get('/', async (req, res) => {
  try {
    // fetch 5 most recent items
    // and 5 largest collections
    const recentItems = await Item.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'collectionId',
        select: 'name'
      })
      .populate('tags')
      .lean();

    const selectedCollections = await Collection.aggregate([
      {
        $project: {
          _id: 1,
          itemCount: { $size: '$items' }
        }
      },
      { $sort: { itemCount: -1 } },
      { $limit: 5 }
    ]);

    const collectionIds = selectedCollections.map((c) => c._id);

    const largestCollections = await Collection.find({
      _id: { $in: collectionIds }
    })
      .populate({ path: 'items', select: 'name' })
      .populate({ path: 'user', select: 'username' })
      .lean();

    res.status(200).json({
      recentItems,
      largestCollections
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'main_page_fetch_failed' });
  }
});

router.get('/search', async (req, res) => {
  const searchQuery = req.query.q;
  const page = Number(req.query.page) || 1;
  const limit = 10;

  if (page < 1 || limit < 1) {
    return res.status(400).send({ error: 'invalid_paging' });
  }

  try {
    const itemResultsPromise = Item.aggregate([
      {
        $search: {
          index: 'item_search',
          text: {
            query: searchQuery,
            path: {
              wildcard: '*'
            }
          }
        }
      },
      { $addFields: { source: 'items' } },
      {
        $project: {
          name: 1,
          collectionId: 1,
          source: 1
        }
      }
    ])
      .exec()
      .then((items) => {
        return Item.populate(items, {
          path: 'collectionId',
          select: 'name user',
          populate: { path: 'user', select: 'username' }
        });
      });

    const tagResultsPromise = Tag.aggregate([
      {
        $search: {
          index: 'tags_search',
          text: {
            query: searchQuery,
            path: ['label', 'value']
          }
        }
      },
      { $addFields: { source: 'tags' } },
      {
        $project: {
          items: 1,
          source: 1,
          _id: 0
        }
      }
    ])
      .exec()
      .then((tags) =>
        Tag.populate(tags, {
          path: 'items',
          select: 'name collectionId',
          populate: {
            path: 'collectionId',
            select: 'name user',
            populate: { path: 'user', select: 'username' }
          }
        })
      )
      .then((tags) => {
        const transformedItems = tags.flatMap((t) =>
          t.items.map((item) => ({
            ...item.toObject(),
            source: t.source
          }))
        );

        return transformedItems;
      });

    const commentResultsPromise = Comment.aggregate([
      {
        $search: {
          index: 'comments_search',
          text: {
            query: searchQuery,
            path: 'text'
          }
        }
      },
      { $addFields: { source: 'comments' } },
      {
        $project: {
          item: 1,
          source: 1,
          _id: 0
        }
      }
    ])
      .exec()
      .then((comments) => {
        return Comment.populate(comments, {
          path: 'item',
          select: 'name collectionId',
          populate: {
            path: 'collectionId',
            select: 'name user',
            populate: { path: 'user', select: 'username' }
          }
        });
      })
      .then((comments) => {
        const transformedItems = comments.flatMap((c) => ({
          ...c.item.toObject(),
          source: c.source
        }));

        return transformedItems;
      });

    const [itemResults, tagResults, commentResults] = await Promise.all([
      itemResultsPromise,
      tagResultsPromise,
      commentResultsPromise
    ]);

    const combinedResults = [...itemResults, ...tagResults, ...commentResults];

    const groupedResults = combinedResults.reduce((acc, result) => {
      const existingItem = acc.find((item) => item._id.equals(result._id));
      if (existingItem) {
        existingItem.source.push(result.source);
      } else {
        acc.push({ ...result, source: [result.source] });
      }
      return acc;
    }, []);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = groupedResults.slice(startIndex, endIndex);

    const totalCount = groupedResults.length;

    console.log(groupedResults);

    res.status(200).send({
      results,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalResults: totalCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('search_results_fetch_failed');
  }
});

router.get('/warmup', async (req, res) => {
  try {
    const userExists = await User.exists({ email: 'admin@tiescl.uz' });

    if (userExists) {
      return res.status(200).send({ message: 'all_good' });
    } else {
      return res.status(500).json({ error: 'Warm-up failed: User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Warm-up failed' });
  }
});

router.get('/current-user', checkCurrentUser, async (req, res) => {
  try {
    if (res.locals.user) {
      res.json(res.locals.user);
    } else {
      res.status(200).json({});
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'current_user_not_found' });
  }
});

router.post('/create-ticket', checkCurrentUser, async (req, res) => {
  const currentUser = res.locals.user;

  try {
    const { summary, description, priority, collection, link } = req.body;

    if (!currentUser) {
      return res.status(404).send({ error: 'user_not_found' });
    }

    const user = await jira.searchUsers({
      query: currentUser.email
    });
    const userExists = user?.length > 0 || false;

    let reporterAccountId;
    let userNew = false;

    if (!userExists) {
      const newUser = await jira.createUser({
        emailAddress: currentUser.email,
        displayName: currentUser.username,
        products: []
      });
      reporterAccountId = newUser.accountId;
      userNew = true;
    } else {
      reporterAccountId = user[0].accountId;
    }

    const issue = {
      fields: {
        project: {
          key: 'CSUP'
        },
        issuetype: {
          name: 'Ticket'
        },
        summary: summary,
        priority: {
          name: priority
        },
        description: description,
        customfield_10033: { accountId: reporterAccountId },
        customfield_10034: collection,
        customfield_10035: link,
        customfield_10037: { value: 'Opened' }
      }
    };

    const createdIssue = await jira.addNewIssue(issue);

    res.status(201).json({
      message: 'ticket_init_successful',
      issueLink: `https://cms-tiescl.atlassian.net/browse/${createdIssue.key}`,
      userNew: userNew
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'ticket_init_failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // handle user login
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.status(200).json({ user: user, token: token });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // handle user registration
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
    res.status(201).json({ user: newUser, token: token });
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
