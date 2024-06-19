import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import ItemCard from './components/items/Card';
import CollectionCard from './components/collections/Card';
import ErrorPage from './components/layout/ErrorPage';
import LoadingScreen from './components/layout/LoadingScreen';

export default function App() {
  const [items, setItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const { t } = useTranslation();

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ['latestData'],
    queryFn: async () => {
      const response = await fetch(`${prodUrl}/api`);
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
      setItems(data.recentItems);
      setCollections(data.largestCollections);
    }
  }, [data]);

  return (
    <>
      {isLoading || !items.length || !collections.length ? (
        <LoadingScreen message='loading.recent' />
      ) : isError ? (
        <ErrorPage err={error.message} />
      ) : (
        <>
          <Greeting t={t} />
          <h1 className='text-center fw-semibold fs-2 py-4 border-bottom border-1'>
            {t('main.recent.items')}
          </h1>
          <div
            style={{ whiteSpace: 'nowrap' }}
            className='overflow-x-auto d-flex'
          >
            {items.map((item) => (
              <div style={{ minWidth: '425px' }} key={item._id}>
                <ItemCard item={item} />
              </div>
            ))}
          </div>
          <h1 className='text-center fw-semibold fs-2 mt-2 py-4 border-bottom border-1'>
            {t('main.largest.collections')}
          </h1>
          <div
            style={{ whiteSpace: 'nowrap' }}
            className='overflow-x-auto d-flex'
          >
            {collections.map((collection) => (
              <div key={collection._id} className=' p-5'>
                <CollectionCard collection={collection} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function Greeting({ t }) {
  return (
    <div
      className='container-fluid row align-items-center'
      style={{
        marginTop: '125px'
      }}
    >
      <div className='col-md-8 col-lg-5 mx-4 mb-4'>
        <h2>{t('main.heading')}</h2>
        <p className='fs-5'>{t('main.description')}</p>
        <Link to='/collections' className='btn btn-primary'>
          <i className='bi bi-list-ul'></i> {t('nav.browseCollections')}
        </Link>
      </div>
    </div>
  );
}
