import Collection from './Collection';

export default interface SearchResult {
  _id: string;
  name: string;
  collection: string | Collection;
  source: string[];
}
