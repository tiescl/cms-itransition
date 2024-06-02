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
  collections: [
    {
      type: SchemaTypes.ObjectId,
      ref: 'Collection'
    }
  ]
});

const Tag = model('Tag', tagSchema);

export default Tag;
