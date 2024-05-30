import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // get a table view of all collections
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Fetching Collections');
  }
});

router.post('/create', async (req, res) => {
  try {
    // create a new collection; auth- and admin-only
    // const tagIds = await Promise.all(
    //   tags.map(async (tag) => {
    //     let existingTag = await Tag.findOne({ name: tag });
    //     if (!existingTag) {
    //       existingTag = await Tag.create({
    //         name: tag,
    //         collections: [collection._id]
    //       });
    //     }
    //     return existingTag._id;
    //   })
    // );
    // const collection = new Collection({
    //   tags: tagIds
    // });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Creating a Collection');
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
