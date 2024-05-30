import { Schema, SchemaTypes, model } from 'mongoose';

const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
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
