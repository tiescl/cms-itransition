import { Schema, SchemaTypes, model } from 'mongoose';

const tagSchema = new Schema({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  items: [
    {
      type: SchemaTypes.ObjectId,
      ref: 'Item'
    }
  ]
});

const Tag = model('Tag', tagSchema);

export default Tag;
