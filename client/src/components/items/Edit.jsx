import LoadingScreen from '../LoadingScreen.jsx';
import ErrorPage from '../ErrorPage.jsx';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import getHumanReadableError from '../../utils/getHumanReadableError.js';
import ItemForm from './ItemForm.jsx';

export default function EditItem() {
  const { collectionId, itemId } = useParams();
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
          `${prodUrl}/api/collections/${collectionId}/${itemId}`,
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
          setError(getHumanReadableError(err.message));
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
    <ItemForm itemData={itemData} editMode='true' />
  ) : (
    <LoadingScreen message='Fetching item data. Taking too long? Try refreshing the page.' />
  );
}
