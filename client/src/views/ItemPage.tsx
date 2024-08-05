import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import UserContext from '../context/UserContext';

import {
  ItemDetails,
  ItemFields,
  CommentBox,
  CommentForm
} from '../components/items/PageTiny';
import LoadingScreen from '../components/layout/LoadingScreen';
import ErrorPage from '../components/layout/ErrorPage';

import Item from '../types/Item';
import Tag from '../types/Tag';
import Comment from '../types/Comment';

import '../styles/bootstrp.css';

export default function ItemPage() {
  let { t } = useTranslation();
  let { collectionId, itemId } = useParams();

  var { user } = useContext(UserContext);
  var [item, setItem] = useState<Item | null>(null);
  var [reqError, setReqError] = useState('');

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  var { isLoading, isError, error, data } = useQuery({
    queryKey: ['itemData', itemId, collectionId],
    queryFn: async () => {
      let response = await fetch(
        `${prodUrl}/api/collections/${collectionId}/items/${itemId}`
      );
      if (!response.ok) {
        let errorData = await response.json();
        throw new Error(errorData.error);
      }
      return response.json();
    },
    staleTime: 10 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!itemId
  });

  useEffect(() => {
    if (!isLoading) {
      setItem(data);
    }
  }, [data, itemId, collectionId]);

  return (
    <>
      {isError || reqError ? (
        <ErrorPage err={isError ? (error?.message ?? '') : reqError} />
      ) : item && !isLoading ? (
        <>
          <ItemDetails
            collectionId={collectionId ?? ''}
            item={item}
            setItem={setItem}
            user={user}
            setError={setReqError}
          />

          <ItemFields fields={item.fields} />

          <div className='container'>
            {(item.tags as Tag[])?.map((tag) => (
              <span
                key={tag._id}
                className='badge rounded-pill bg-primary me-2 mb-3'
                style={{ fontSize: '15px' }}
              >
                {tag.label}
              </span>
            ))}
          </div>

          <div
            id='enforce-width-95-item1'
            className='container border border-2 rounded-4 p-3 mb-4 mt-2'
          >
            <h2 className='fw-semibold fs-2'>
              <i className='bi bi-chat-text'></i> {t('item.comments')} (
              {item.comments?.length || 0})
            </h2>

            {(item.comments as Comment[])?.map((comment) => (
              <CommentBox key={comment._id} comment={comment} />
            ))}
            {item.comments.length ? (
              ''
            ) : (
              <h4 className='mt-3'>{t('comments.firstMsg')}</h4>
            )}

            {user && item && (
              <CommentForm
                collectionId={collectionId ?? ''}
                itemId={item._id}
                user={user}
                setItem={
                  setItem as React.Dispatch<React.SetStateAction<Item>>
                }
                prodUrl={prodUrl}
              />
            )}
          </div>
        </>
      ) : (
        <LoadingScreen message='loading.item' />
      )}
    </>
  );
}
