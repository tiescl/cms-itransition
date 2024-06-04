import { SchemaTypes, Schema, model } from 'mongoose';

const collectionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
    immutable: true
  },
  lastModified: {
    type: Date,
    default: () => new Date()
  },
  likesCount: {
    type: Number,
    default: 0
  },
  user: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  items: [
    {
      name: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      client_id: {
        type: String,
        required: true
      }
    }
  ],
  tags: [
    {
      type: SchemaTypes.ObjectId,
      ref: 'Tag'
    }
  ],
  comments: [
    {
      type: SchemaTypes.ObjectId,
      ref: 'Comment'
    }
  ]
});

const Collection = model('Collection', collectionSchema);

export default Collection;
