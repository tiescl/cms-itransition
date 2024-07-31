import { CustomField } from './Collection';

export default interface IFormData {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  customFieldDefinitions: CustomField[];
}
