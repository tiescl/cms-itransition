import { Schema, model } from 'mongoose';
import Collection from './collection.js';
import User from './user.js';

const commentSchema = new Schema({
  author: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  collection: {
    type: SchemaTypes.ObjectId,
    ref: 'Collection',
    required: true
  },
  timestamp: {
    type: Date,
    default: () => Date.now(),
    immutable: true
  }
});

const Comment = model('Comment', commentSchema);

export default Comment;
