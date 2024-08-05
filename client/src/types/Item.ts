import Collection from './Collection';
import Tag from './Tag';
import User from './User';
import Comment from './Comment';

export default interface Item {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  collection: string | Collection;
  tags: string[] | Tag[];
  likes: string[] | User[];
  comments: string[] | Comment[];
  fields: ItemField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemField {
  _id: string;
  name: string;
  value: string;
  type: string;
}
