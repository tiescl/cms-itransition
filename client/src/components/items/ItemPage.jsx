import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserContext from '../../context/UserContext.jsx';
import ThemeContext from '../../context/ThemeContext.jsx';

import stringifyDate from '../../utils/stringifyDate.js';
import { v4 as uuid } from 'uuid';

import LoadingScreen from '../layout/LoadingScreen.jsx';
import ErrorPage from '../layout/ErrorPage.jsx';

import '../../styles/bootstrp.css';

export default function ItemPage() {
  const { collectionId, itemId } = useParams();
  const { user } = useContext(UserContext);
  const { t } = useTranslation();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();

    const fetchItem = async () => {
      try {
        const response = await fetch(
          `${prodUrl}/api/collections/${collectionId}/items/${itemId}`,
          {
            signal: controller.signal
          }
        );
        if (response.ok) {
          const data = await response.json();
          setItem(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          // console.log(err.message);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();

    const intervalId = setInterval(fetchItem, 10000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [collectionId, itemId]);

  return (
    <>
      {error ? (
        <ErrorPage err={error} />
      ) : item && !isLoading ? (
        <>
          <ItemDetails
            collectionId={collectionId}
            item={item}
            setItem={setItem}
            user={user}
            setError={setError}
          />

          <ItemFields fields={item.fields} />

          <div className='container'>
            {item.tags.map((tag) => (
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

            {item.comments?.map((comment) => (
              <CommentBox key={comment._id} comment={comment} />
            ))}
            {item.comments.length ? (
              ''
            ) : (
              <h4 className='mt-3'>{t('comments.firstMsg')}</h4>
            )}

            {user && (
              <CommentForm
                collectionId={collectionId}
                itemId={item._id}
                user={user}
                setItem={setItem}
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

function ItemDetails({ collectionId, item, setItem, user, setError }) {
  const [liked, setLiked] = useState(item.likes?.includes(user?._id) || false);
  const [likesCount, setLikesCount] = useState(item.likes?.length || 0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');

  const handleLike = async (event) => {
    try {
      event.target.disabled = true;
      setLikesCount((prevCount) => prevCount + (liked ? -1 : 1));
      setLiked(!liked);

      const response = await fetch(
        `${prodUrl}/api/collections/${collectionId}/items/${item._id}/like`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // console.log(data);
        setItem({
          ...item,
          likes: data.likes
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      event.target.disabled = false;
    }
  };

  const handleDeleteItem = async () => {
    try {
      const response = await fetch(
        `${prodUrl}/api/collections/${collectionId}/items/${item._id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // console.log(data);
        navigate(`/collections/${collectionId}`);
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
      id='enforce-width-95-item2'
    >
      <div className='row'>
        <div className='col-9'>
          <h1 className='fs-1'>{item.name}</h1>
        </div>

        <div className='col-3 d-flex align-items-start justify-content-end'>
          {user &&
            (user.collections.includes(collectionId) || user.isAdmin) && (
              <>
                <Link
                  to={`/collections/${collectionId}/items/${item._id}/edit`}
                  state={{ collectionData: item.collectionId }}
                >
                  <button className='btn btn-primary mt-1 me-2'>
                    <i className='bi bi-pencil-square'></i>
                  </button>
                </Link>

                <Link to={`/collections/${collectionId}`}>
                  <button
                    className='btn btn-danger mt-1'
                    onClick={handleDeleteItem}
                  >
                    <i className='bi bi-trash'></i>
                  </button>
                </Link>
              </>
            )}
        </div>
      </div>

      <p className='fs-5 mb-1'>
        {t('item.location')}:{' '}
        <Link
          to={`/collections/${collectionId}`}
          className='text-decoration-none text-body-secondary'
        >
          <span className='fw-bold'>
            {item.collectionId.name || 'Unknown Collection'}
          </span>
        </Link>
      </p>

      <button
        className='btn btn-outline-primary btn-sm mt-2'
        onClick={handleLike}
      >
        <i
          className={`bi ${
            liked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'
          }`}
        ></i>{' '}
        {item.likes?.length || likesCount} {t('item.likes')}
      </button>

      <p className='text-body-secondary mt-3 mb-1'>
        <small>
          {t('created')}: {stringifyDate(item.createdAt, t)}
        </small>
      </p>
      <p className='text-body-secondary mb-2'>
        <small>
          {t('modified')}: {stringifyDate(item.updatedAt, t)}
        </small>
      </p>
    </div>
  );
}

function CommentBox({ comment }) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <div className='border-top border-bottom p-2 w-100'>
      <div className='d-flex align-items-center'>
        <Link
          to={`/users/${comment.author._id}`}
          className='text-decoration-none'
        >
          <span
            className={`fw-bold text-${theme === 'light' ? 'dark' : 'light'} `}
          >
            {comment.author.username}
          </span>
        </Link>
        <small className='text-body-secondary'>
          , {t('comments.added')}{' '}
          {stringifyDate(comment.createdAt || new Date(), t)}
        </small>
      </div>
      <p className='mb-0'>{comment.text}</p>
    </div>
  );
}

function CommentForm({ collectionId, itemId, user, setItem, prodUrl }) {
  const [commentText, setCommentText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { t } = useTranslation();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('auth');

    try {
      const now = String(new Date());
      setItem((prevItem) => ({
        ...prevItem,
        comments: [
          ...prevItem.comments,
          {
            _id: `tmp-${uuid()}`,
            author: user,
            text: commentText,
            item: prevItem._id
          }
        ]
      }));
      setCommentText('');
      const response = await fetch(
        `${prodUrl}/api/collections/${collectionId}/items/${itemId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text: commentText })
        }
      );
      if (response.ok) {
        const data = await response.json();
        // console.log(data);
        setItem((prevItem) => ({
          ...prevItem,
          comments: [
            ...prevItem.comments.filter(
              (comment) => !comment._id.startsWith('tmp-')
            ),
            data
          ]
        }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <>
      {errorMessage && (
        <p className='text-danger mt-1'>
          {t(errorMessage, { defaultValue: t('error.default') })}
        </p>
      )}

      <form onSubmit={handleSubmit} className='mb-3 mt-5'>
        <textarea
          className='form-control'
          placeholder={t('comments.placeholder')}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onFocus={() => setErrorMessage('')}
        ></textarea>
        <button type='submit' className='btn btn-primary mt-2'>
          {t('comments.button')}
        </button>
      </form>
    </>
  );
}

function ItemFields({ fields }) {
  const { t } = useTranslation();

  return (
    <>
      <div className='mt-4'>
        <div
          id='enforce-width-95-item3'
          className='container border border-2 rounded-4 p-3 mb-4 mt-2'
        >
          <h2 className='fs-2 fw-semibold mb-3'>
            <i className='bi bi-collection fs-3'></i> {t('item.fields')} (
            {fields?.length || 0})
          </h2>
          <table className='table table-bordered table-striped table-hover w-full mx-auto'>
            <thead>
              <tr>
                <th className='col-6'>{t('fields.name')}</th>
                <th className='col-6'>{t('fields.value')}</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.client_id}>
                  <td style={{ whiteSpace: 'normal' }}>{field.name}</td>
                  <td style={{ whiteSpace: 'normal' }}>
                    {field.value === 'true'
                      ? `${t('fields.true')} ✅`
                      : field.value === 'false'
                      ? `${t('fields.false')} ❌`
                      : field.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
