import { Schema, model, SchemaTypes } from 'mongoose';

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
    default: () => new Date(),
    immutable: true
  }
});

const Comment = model('Comment', commentSchema);

export default Comment;
