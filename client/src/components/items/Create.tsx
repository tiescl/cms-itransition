import ItemForm from '../../views/ItemForm';
import { useLocation } from 'react-router-dom';

export default function CreateItem() {
  let location = useLocation();
  let collectionData = location.state?.collectionData;

  console.log('data' + collectionData);

  return <ItemForm collectionData={collectionData} />;
}
