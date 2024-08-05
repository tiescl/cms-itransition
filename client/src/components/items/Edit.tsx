import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import LoadingScreen from '../layout/LoadingScreen';
import ErrorPage from '../layout/ErrorPage';

import ItemForm from '../../views/ItemForm';

export default function EditItem() {
  let { collectionId, itemId } = useParams();
  let location = useLocation();
  var collectionData = location.state?.collectionData;
  var [itemData, setItemData] = useState(null);
  var [isLoading, setIsLoading] = useState(true);
  var [error, setError] = useState('');

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  useEffect(() => {
    setIsLoading(true);
    let controller = new AbortController();

    const fetchItemData = async () => {
      try {
        let response = await fetch(
          `${prodUrl}/api/collections/${collectionId}/items/${itemId}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          let data = await response.json();
          setItemData(data);
        } else {
          let errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        if ((err as Error)?.name != 'AbortError') {
          setError((err as Error)?.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemData();

    const intervalId = setInterval(fetchItemData, 30000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, []);

  return error ? (
    <ErrorPage err={error} />
  ) : itemData && !isLoading ? (
    <ItemForm
      collectionData={collectionData}
      itemData={itemData}
      editMode={true}
    />
  ) : (
    <LoadingScreen message='loading.item' long={true} />
  );
}
