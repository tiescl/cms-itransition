import React, { useEffect, useState, useContext, Fragment } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import UserContext from '../../context/UserContext';

import stringifyDate from '../../utils/stringifyDate.ts';

import LoadingScreen from '../layout/LoadingScreen';
import ErrorPage from '../layout/ErrorPage';

import '../../styles/bootstrp.css';

export default function CollectionPage() {
  const { collectionId } = useParams();
  const { user } = useContext(UserContext);
  const [collection, setCollection] = useState(null);
  const [reqError, setReqError] = useState('');

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ['collectionData', collectionId],
    queryFn: async () => {
      const response = await fetch(
        `${prodUrl}/api/collections/${collectionId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      return response.json();
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
        <ErrorPage err={isError ? error : reqError} />
      ) : collection && !isLoading ? (
        <>
          <CollectionDetails
            collection={collection}
            user={user}
            setError={setReqError}
          />

          <ItemsDetails
            items={collection.items}
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

function CollectionDetails({ collection, user, setError }) {
  const [forceUpdate, setForceUpdate] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    setForceUpdate(!forceUpdate);
  }, [i18n.language]);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');

  const handleDeleteCollection = async () => {
    try {
      const response = await fetch(
        `${prodUrl}/api/collections/${collection._id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        // const data = await response.json();
        // console.log(data);
        navigate('/collections');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className='container border border-2 rounded-4 p-3 mb-4 fs-5'
      style={{ marginTop: '125px' }}
      id='enforce-width-95-coll1'
    >
      <div className='row'>
        <div className='col-lg-8'>
          <div className='row'>
            <div className='col-9'>
              <h1 className='fs-1'>{collection.name}</h1>
            </div>

            <div className='col-3 d-flex align-items-start justify-content-end'>
              {user &&
                (user._id === collection.user._id || user.isAdmin) && (
                  <>
                    <Link to={`/collections/${collection._id}/edit`}>
                      <button className='btn btn-primary mt-1 me-2'>
                        <i className='bi bi-pencil-square'></i>
                      </button>
                    </Link>

                    <Link to='/collections'>
                      <button
                        className='btn btn-danger mt-1'
                        onClick={handleDeleteCollection}
                      >
                        <i className='bi bi-trash'></i>
                      </button>
                    </Link>
                  </>
                )}
            </div>
          </div>

          <p className='fs-5 mb-1'>
            {t('collection.by')}
            <Link
              to={`/users/${collection.user?._id}`}
              className='text-decoration-none text-body-secondary'
            >
              <span className='fw-bold'>
                {collection.user?.username || 'Incognito'}
              </span>
            </Link>
          </p>

          <p className='mb-1'>
            <span className='fw-bold'>{t('collection.items')}: </span>
            {collection.items.length}
          </p>

          <p className='mb-2 text-capitalize'>
            <span className='fw-bold'>{t('collection.category')}: </span>
            {collection.category}
          </p>

          <p
            className='text-wrap'
            style={{
              maxHeight: '3.6em'
            }}
          >
            <span className='fw-bold'>
              {t('collection.description.short')}:{' '}
            </span>
            {collection.description}
          </p>

          <p className='text-body-secondary mt-4 mb-1'>
            <small>
              {t('created')}:{' '}
              {stringifyDate(collection.createdAt, t, forceUpdate)}
            </small>
          </p>
          <p className='text-body-secondary mb-2'>
            <small>
              {t('modified')}:{' '}
              {stringifyDate(collection.updatedAt, t, forceUpdate)}
            </small>
          </p>
        </div>

        <div className='col-lg-4 d-flex align-items-center justify-content-center'>
          {collection.imageUrl ? (
            <img
              src={collection.imageUrl}
              className='img-fluid border-3 img-thumbnail rounded'
              alt={collection.name}
              style={{ maxHeight: '300px' }}
            />
          ) : (
            <div className='img-fluid border-3 img-thumbnail rounded placeholder-image-page'></div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemsDetails({
  items,
  collection,
  collectionId,
  contextUser,
  setError
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await fetch(
        `${prodUrl}/api/collections/${collectionId}/items/${itemId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        // const data = await response.json();
        // console.log(data);
        navigate(`/collections/${collectionId}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (err) {
      console.log(err.message);
      setError(err.message);
    }
  };

  return (
    <div className='mt-4'>
      <div
        id='enforce-width-95-coll2'
        className='container border border-2 rounded-4 p-3 mb-4 mt-2 align-middle'
      >
        <div className='row mb-2 mt-1'>
          <div className='col-6'>
            <h2 className='fs-2 fw-semibold'>
              <i className='bi bi-collection fs-3'></i>{' '}
              {t('collection.items')} ({items?.length || 0})
            </h2>
          </div>
          <div className='col-6 text-end'>
            {contextUser &&
              (collection.user._id.includes(contextUser._id) ||
                contextUser.isAdmin) && (
                <Link
                  to={`/collections/${collectionId}/items/create`}
                  state={{ collectionData: collection }}
                >
                  <button className='btn btn-primary btn-sm'>
                    <i className='bi bi-plus-circle'></i>{' '}
                    {t('collection.newItem')}
                  </button>
                </Link>
              )}
          </div>
        </div>
        <table className='table table-fixed table-bordered table-hover'>
          <tbody>
            {items?.map((item) => (
              <Fragment key={item._id}>
                <tr className='align-middle'>
                  <td>
                    <Link
                      to={`/collections/${collectionId}/items/${item._id}`}
                      className='text-decoration-none text-body-secondary'
                    >
                      <h6 className='m-0 fs-4 fw-bold my-2'>
                        {item.name}
                      </h6>
                    </Link>
                  </td>
                  <td className='text-end' style={{ borderLeft: 'none' }}>
                    {contextUser &&
                      (collection.user._id.includes(contextUser._id) ||
                        contextUser.isAdmin) && (
                        <>
                          <Link
                            to={`/collections/${collectionId}/items/${item._id}/edit`}
                            state={{ collectionData: collection }}
                          >
                            <button className='btn btn-primary btn-sm me-2'>
                              <i className='bi bi-pencil-square'></i>
                            </button>
                          </Link>
                          <button
                            className='btn btn-danger btn-sm me-2'
                            onClick={() => handleDeleteItem(item._id)}
                          >
                            <i className='bi bi-trash'></i>
                          </button>
                        </>
                      )}
                  </td>
                </tr>
                {item.fields.map((field, index) => (
                  <tr
                    key={field.client_id}
                    style={{
                      borderBottom: `${
                        index === item.fields.length - 1
                          ? '2px dashed #989898'
                          : ''
                      }`
                    }}
                  >
                    <td className='fw-bold'>{field.name}</td>
                    <td>
                      {field.value === 'true'
                        ? `${t('fields.true')} ✅`
                        : field.value === 'false'
                          ? `${t('fields.false')} ❌`
                          : field.value}
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
