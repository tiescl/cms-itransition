import { useState, useEffect } from 'react';
import CollectionBox from './CollectionBox';
import Navbar from './Navbar';
import LoadingScreen from './LoadingScreen.jsx';

export default function Collections() {
  const [collectionsList, setCollectionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    const fetchCollections = async () => {
      try {
        const response = await fetch(`${prodUrl}/api/collections`);
        if (response.ok && isMounted) {
          const collections = await response.json();
          setCollectionsList(collections);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching collections: ', error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchCollections();

    const intervalId = setInterval(fetchCollections, 10000);

    return () => {
      clearInterval(intervalId);
      isMounted = false;
    };
  }, []);

  return (
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
                <CollectionBox key={collection._id} collection={collection} />
              );
            })}
          </div>
        </div>
      ) : (
        <LoadingScreen message='Fetching collections...' />
      )}
    </>
  );
}
