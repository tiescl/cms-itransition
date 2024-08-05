import { useEffect, useState, useContext, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeContext from '../../context/ThemeContext';

import stringifyDate from '../../utils/stringifyDate';
import { v4 as uuid } from 'uuid';

import Item from '../../types/Item';
import { ItemField } from '../../types/Item';
import User from '../../types/User';
import Comment from '../../types/Comment';
import Collection from '../../types/Collection';

interface IItemDetailsProps {
  collectionId: string;
  item: Item;
  setItem: React.Dispatch<React.SetStateAction<Item | null>>;
  user: User | null;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

function ItemDetails({
  collectionId,
  item,
  setItem,
  user,
  setError
}: IItemDetailsProps) {
  let { t, i18n } = useTranslation();
  let navigate = useNavigate();

  var [liked, setLiked] = useState(
    (item.likes as string[])?.includes((user as User)?._id) ?? false
  );
  var [likesCount, setLikesCount] = useState(item.likes?.length ?? 0);
  var [forceUpdate, setForceUpdate] = useState(false);
  var [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setForceUpdate(!forceUpdate);
  }, [i18n.language]);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');

  let handleLike = async () => {
    try {
      setIsLoading(true);
      setLikesCount((prevCount) => prevCount + (liked ? -1 : 1));
      setLiked(!liked);

      let response = await fetch(
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
        let data = await response.json();
        // console.log(data);
        setItem({
          ...item,
          likes: data.likes
        });
      } else {
        let errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (err) {
      setError((err as Error)?.message);
    } finally {
      setIsLoading(false);
    }
  };

  let handleDeleteItem = async () => {
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
        // const data = await response.json();
        // console.log(data);
        navigate(`/collections/${collectionId}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (err) {
      setError((err as Error)?.message);
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
            ((user.collections as string[]).includes(collectionId) ||
              user.isAdmin) && (
              <>
                <Link
                  to={`/collections/${collectionId}/items/${item._id}/edit`}
                  state={{ collectionData: item.collection }}
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
            {(item.collection as Collection)?.name || 'Unknown Collection'}
          </span>
        </Link>
      </p>

      <button
        className='btn btn-outline-primary btn-sm mt-2'
        onClick={handleLike}
        disabled={isLoading}
      >
        <i
          className={`bi ${
            liked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'
          }`}
        ></i>{' '}
        {item.likes?.length || likesCount}{' '}
        {item.likes?.length == 1 || likesCount == 1
          ? t('item.like')
          : t('item.likes')}
      </button>

      <p className='text-body-secondary mt-3 mb-1'>
        <small>
          {t('created')}: {stringifyDate(item.createdAt, t, forceUpdate)}
        </small>
      </p>
      <p className='text-body-secondary mb-2'>
        <small>
          {t('modified')}: {stringifyDate(item.updatedAt, t, forceUpdate)}
        </small>
      </p>
    </div>
  );
}

interface ICommentBoxProps {
  comment: Comment;
}

function CommentBox({ comment }: ICommentBoxProps) {
  let { t } = useTranslation();
  let { theme } = useContext(ThemeContext);

  return (
    <div className='border-top border-bottom p-2 w-100'>
      <div className='d-flex align-items-center'>
        <Link
          to={`/users/${(comment.author as User)?._id}`}
          className='text-decoration-none'
        >
          <span
            className={`fw-bold text-${theme === 'light' ? 'dark' : 'light'} `}
          >
            {(comment.author as User)?.username}
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

interface ICommentFormProps {
  collectionId: string;
  itemId: string;
  user: User;
  setItem: React.Dispatch<React.SetStateAction<Item>>;
  prodUrl: string;
}

function CommentForm({
  collectionId,
  itemId,
  user,
  setItem,
  prodUrl
}: ICommentFormProps) {
  let { t } = useTranslation();

  var [commentText, setCommentText] = useState('');
  var [errorMessage, setErrorMessage] = useState('');

  let handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = localStorage.getItem('auth');

    try {
      setItem((prevItem) => ({
        ...prevItem,
        comments: [
          ...prevItem.comments,
          {
            _id: `tmp-${uuid()}`,
            author: user._id,
            text: commentText,
            item: prevItem._id
          }
        ] as Comment[]
      }));
      setCommentText('');
      let response = await fetch(
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
        let data = await response.json();
        // console.log(data);
        setItem((prevItem) => ({
          ...prevItem,
          comments: [
            ...prevItem.comments.filter(
              (comment) => !(comment as Comment)?._id.startsWith('tmp-')
            ),
            data
          ]
        }));
      } else {
        let errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (err) {
      setErrorMessage((err as Error)?.message);
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

interface IItemFieldsProps {
  fields: ItemField[];
}

function ItemFields({ fields }: IItemFieldsProps) {
  let { t } = useTranslation();

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
              {fields?.map((field) => (
                <tr key={field._id}>
                  <td style={{ whiteSpace: 'normal' }}>{field.name}</td>
                  <td style={{ whiteSpace: 'normal' }}>
                    {field.value == 'true'
                      ? `${t('fields.true')} ✅`
                      : field.value == 'false'
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

export { ItemDetails, ItemFields, CommentBox, CommentForm };
