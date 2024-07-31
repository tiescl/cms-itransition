import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import LoadingScreen from '../layout/LoadingScreen';
import ErrorPage from '../layout/ErrorPage';
import CollectionForm from '../../views/CollectionForm.js';
import Collection from '../../types/Collection';

export default function EditCollection() {
  let { collectionId } = useParams();
  var [collectionData, setCollectionData] = useState<Collection | null>(
    null
  );

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  var { data, isLoading, error, isError } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: async () => {
      let response = await fetch(
        `${prodUrl}/api/collections/${collectionId}`
      );
      if (response.ok) {
        return await response.json();
      } else {
        let errorData = await response.json();
        throw new Error(errorData.error);
      }
    },
    staleTime: 30 * 1000,
    gcTime: 20 * 60 * 1000
  });

  useEffect(() => {
    if (!isLoading) {
      setCollectionData(data);
    }
  }, [data]);

  console.log(collectionData);

  return isError ? (
    <ErrorPage err={error?.message ?? ''} />
  ) : collectionData && !isLoading ? (
    <CollectionForm collectionData={collectionData} editMode={true} />
  ) : (
    <LoadingScreen message='loading.collection' long={true} />
  );
}
