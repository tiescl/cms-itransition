import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // fetch top 5 collections (with most likes) and 5 largest collections
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error fetching collections');
  }
});
