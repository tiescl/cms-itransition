import Collection, { CustomField } from './Collection';
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
  customFields: CustomField[];
  createdAt: Date;
  updatedAt: Date;
}
