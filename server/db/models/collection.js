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
  },
  { suppressReservedKeysWarning: true, timestamps: true }
);

collectionSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, trim: true });
  next();
});

const Collection = model('Collection', collectionSchema);

export default Collection;
