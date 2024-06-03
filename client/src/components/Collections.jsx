import { useState, useEffect } from 'react';
import CollectionBox from './CollectionBox';
import Navbar from './Navbar';

export default function Collections() {
  const [collectionsList, setCollectionsList] = useState([]);

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(`${prodUrl}/api/collections`);
        if (response.ok) {
          const collections = await response.json();
          console.log('fetched');
          setCollectionsList(collections);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (error) {
        console.error('Error fetching collections: ', error.message);
      }
    };
    fetchCollections();

    const intervalId = setInterval(fetchCollections, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Navbar />

      <h1
        style={{
          marginTop: '110px',
          marginBottom: '30px',
          fontSize: '40px',
          fontWeight: '500'
        }}
        className='text-center'
      >
        Collections
      </h1>

      <div className='container'>
        <div className='row'>
          {collectionsList.map((collection) => {
            console.log(collection);
            return (
              <CollectionBox key={collection._id} collection={collection} />
            );
          })}
        </div>
      </div>
    </>
  );
}
