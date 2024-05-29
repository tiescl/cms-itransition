import { Schema, model } from 'mongoose';
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
  registerDate: {
    type: Date,
    default: () => Date.now(),
    immutable: true
  },
  lastLoginDate: {
    type: Date,
    default: () => Date.now()
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
      user.lastLoginDate = Date.now();
      user.save();
      return user;
    }
    throw Error('Incorrect Password');
  }
  throw Error('Incorret Email');
};

const User = model('User', userSchema);

export default User;
