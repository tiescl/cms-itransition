import { useState, useEffect } from 'react';
import CollectionCard from './Card.jsx';
import Navbar from '../Navbar.jsx';
import LoadingScreen from '../LoadingScreen.jsx';
import ErrorPage from '../ErrorPage.jsx';

import fetchCollections from './fetchCollection.js';
import getHumanReadableError from '../../utils/getHumanReadableError.js';

export default function Collections() {
  const [collectionsList, setCollectionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();

    const fetchCollectionsData = async () => {
      try {
        await fetchCollections(
          prodUrl,
          setCollectionsList,
          setError,
          setIsLoading,
          controller.signal
        );
      } catch (err) {
        if (err.message !== 'request_canceled') {
          setError(getHumanReadableError(err.message));
        }
      }
    };

    fetchCollectionsData();

    const intervalId = setInterval(fetchCollectionsData, 10000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, []);

  return (
    <>
      {error ? (
        <ErrorPage err={error} />
      ) : (
        <>
          <Navbar />

          <h1
            style={{
              marginTop: '130px',
              marginBottom: '40px',
              fontSize: '40px',
              fontWeight: '500'
            }}
            className='text-center'
          >
            Collections
          </h1>

          {!isLoading && collectionsList ? (
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
            <LoadingScreen message='Fetching collections...' />
          )}
        </>
      )}
    </>
  );
}
