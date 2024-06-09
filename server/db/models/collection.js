import { SchemaTypes, Schema, model } from 'mongoose';
import slugify from 'slugify';

const collectionSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    slug: {
      type: String
    },
    imageUrl: {
      type: String,
      default: ''
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
    items: {
      type: SchemaTypes.ObjectId,
      ref: 'Item'
    },
    customFieldDefinitions: [
      {
        client_id: {
          type: String
        },
        name: {
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

collectionSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, trim: true });
  next();
});

const Collection = model('Collection', collectionSchema);

export default Collection;
