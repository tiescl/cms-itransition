import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import LoadingScreen from '../layout/LoadingScreen.jsx';
import ErrorPage from '../layout/ErrorPage.jsx';

import ItemForm from './ItemForm.jsx';

export default function EditItem() {
  const { collectionId, itemId } = useParams();
  const location = useLocation();
  const collectionData = location.state?.collectionData;
  const [itemData, setItemData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();

    const fetchItemData = async () => {
      try {
        const response = await fetch(
          `${prodUrl}/api/collections/${collectionId}/items/${itemId}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const data = await response.json();
          setItemData(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
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
    <LoadingScreen message='loading.item' long='true' />
  );
}
