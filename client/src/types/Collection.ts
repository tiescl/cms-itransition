import User from './User';
import Item from './Item';

export default interface Collection {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  user: string | User;
  items: string[] | Item[];
  customFieldDefinitions: CustomField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomField {
  _id: string;
  name: string;
  type: string;
}
