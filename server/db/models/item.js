import { model, Schema, SchemaTypes } from 'mongoose';

const itemSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    collection: {
      type: SchemaTypes.ObjectId,
      ref: 'Collection',
      required: true
    },
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
    ],
    likes: [
      {
        type: SchemaTypes.ObjectId,
        ref: 'User'
      }
    ],
    fields: [
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
        }
      }
    ]
  },
  { suppressReservedKeysWarning: true, timestamps: true }
);

const Item = model('Item', itemSchema);

export default Item;
