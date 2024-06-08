import ItemForm from './ItemForm';
import { useLocation } from 'react-router-dom';

export default function CreateItem({ collectionData }) {
  const location = useLocation();
  const collectionData = location.state?.collectionData;
  return <ItemForm collectionData={collectionData} />;
}
