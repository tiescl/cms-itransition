import Collection from './Collection';

export default interface SearchResult {
  _id: string;
  name: string;
  collectionId: string | Collection;
  source: string[];
}
