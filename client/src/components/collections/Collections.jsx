import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import CollectionCard from './Card.jsx';
import LoadingScreen from '../layout/LoadingScreen.jsx';
import ErrorPage from '../layout/ErrorPage.jsx';

export default function Collections() {
  const [collectionsList, setCollectionsList] = useState([]);

  const { t } = useTranslation();

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ['collectionsData'],
    queryFn: async () => {
      const response = await fetch(`${prodUrl}/api/collections`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      return response.json();
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  useEffect(() => {
    if (!isLoading) {
      setCollectionsList(data);
    }
  }, [data]);

  return (
    <>
      {isError ? (
        <ErrorPage err={error} />
      ) : (
        <>
          <h1
            style={{
              marginTop: '130px',
              marginBottom: '40px',
              fontSize: '40px',
              fontWeight: '500'
            }}
            className='text-center'
          >
            {t('collections.heading')}
          </h1>

          {!isLoading && collectionsList.length !== 0 ? (
            <div className='container'>
              <div className='row d-flex'>
                {collectionsList.map((collection) => {
                  return (
                    <CollectionCard
                      key={collection._id}
                      collection={collection}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <LoadingScreen message='loading.collections' />
          )}
        </>
      )}
    </>
  );
}
