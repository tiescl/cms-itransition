import Item from './Item';

export default interface Tag {
  _id?: string;
  label: string;
  value: string;
  items?: string[] | Item[];
}
