import Collection from './Collection';

export default interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isBlocked: boolean;
  collections: string[] | Collection[];
  registerDate: Date;
  lastLoginDate: Date;
}
