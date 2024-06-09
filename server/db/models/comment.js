import { Schema, model, SchemaTypes } from 'mongoose';

const commentSchema = new Schema(
  {
    author: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    item: {
      type: SchemaTypes.ObjectId,
      ref: 'Item',
      required: true
    }
  },
  { timestamps: true }
);

const Comment = model('Comment', commentSchema);

export default Comment;
