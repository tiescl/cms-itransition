import ItemForm from './ItemForm';
import { useLocation } from 'react-router-dom';

export default function CreateItem() {
  const location = useLocation();
  const collectionData = location.state?.collectionData;
  console.log(collectionData);
  return <ItemForm collectionData={collectionData} />;
}
