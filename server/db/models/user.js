import { Schema, SchemaTypes, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    validate: {
      validator: (v) => v.length > 1,
      message: (props) => `username ${props.value} is too short`
    }
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    minlength: 5
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  collections: [
    {
      type: SchemaTypes.ObjectId,
      ref: 'Collection'
    }
  ],
  registerDate: {
    type: String,
    default: () => new Date(),
    immutable: true
  },
  lastLoginDate: {
    type: String,
    default: () => new Date()
  },
  preferredLanguage: {
    type: String,
    default: 'en-US'
  },
  preferredTheme: {
    type: String,
    default: 'light'
  }
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email }).exec();
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      user.lastLoginDate = new Date();
      user.save();
      return user;
    }
    throw new Error('incorrect_password');
  }
  throw new Error('incorrect_email');
};

const User = model('User', userSchema);

export default User;
