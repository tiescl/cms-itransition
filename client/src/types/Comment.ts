import User from './User';
import Item from './Item';

export default interface Comment {
  _id: string;
  author: string | User;
  item: string | Item;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}
