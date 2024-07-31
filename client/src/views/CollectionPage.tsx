import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import UserContext from '../context/UserContext';

import LoadingScreen from '../components/layout/LoadingScreen';
import ErrorPage from '../components/layout/ErrorPage';
import {
  CollectionDetails,
  ItemsDetails
} from '../components/collections/PageTiny';

import Collection from '../types/Collection';
import Item from '../types/Item';
import '../styles/bootstrp.css';

export default function CollectionPage() {
  var { collectionId } = useParams();
  var { user } = useContext(UserContext);
  var [collection, setCollection] = useState<Collection | null>(null);
  var [reqError, setReqError] = useState('');

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  var { isLoading, isError, error, data } = useQuery({
    queryKey: ['collectionData', collectionId],
    queryFn: async () => {
      let response = await fetch(
        `${prodUrl}/api/collections/${collectionId}`
      );
      if (!response.ok) {
        let errorData = await response.json();
        throw new Error(errorData.error);
      }
      return await response.json();
    },
    staleTime: 10 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!collectionId
  });

  useEffect(() => {
    if (!isLoading) {
      setCollection(data);
    }
  }, [data, collectionId]);

  return (
    <>
      {isError || reqError ? (
        <ErrorPage err={isError ? error?.message : reqError} />
      ) : collection && !isLoading ? (
        <>
          <CollectionDetails
            collection={collection}
            user={user}
            setError={setReqError}
          />

          <ItemsDetails
            items={collection.items as Item[]}
            collection={collection}
            collectionId={collection._id}
            contextUser={user}
            setError={setReqError}
          />
        </>
      ) : (
        <LoadingScreen message='loading.collection' />
      )}
    </>
  );
}
