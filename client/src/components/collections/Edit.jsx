import LoadingScreen from '../LoadingScreen.jsx';
import ErrorPage from '../ErrorPage.jsx';
import CollectionForm from './Form.jsx';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import fetchCollection from './fetchCollection.js';
import getHumanReadableError from '../../utils/getHumanReadableError.js';

export default function EditCollection() {
  const { collectionId } = useParams();
  const [collectionData, setCollectionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();

    const fetchCollectionData = async () => {
      try {
        await fetchCollection(
          prodUrl,
          setCollectionData,
          setError,
          setIsLoading,
          controller.signal,
          collectionId
        );
      } catch (err) {
        setError(getHumanReadableError(err.message));
      }
    };

    fetchCollectionData();

    const intervalId = setInterval(fetchCollectionData, 30000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, []);

  return error ? (
    <ErrorPage err={error} />
  ) : collectionData && !isLoading ? (
    <CollectionForm collectionData={collectionData} editMode='true' />
  ) : (
    <LoadingScreen message='Fetching collection data..' long='true' />
  );
}
