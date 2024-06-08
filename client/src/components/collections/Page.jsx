import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserContext from '../../context/UserContext.jsx';

import getHumanReadableError from '../../utils/getHumanReadableError.js';
import fetchCollection from './fetchCollection.js';
import stringifyDate from '../../utils/stringifyDate.js';
import { v4 as uuid } from 'uuid';

import LoadingScreen from '../LoadingScreen.jsx';
import ErrorPage from '../ErrorPage.jsx';
import Navbar from '../Navbar.jsx';

import 'bootstrap-icons/font/bootstrap-icons.min.css';
import '../../styles/bootstrp.css';

// TODO: try wrapping everything in col-md-8 ensure good width

export default function CollectionPage() {
  const { collectionId } = useParams();
  const { user } = useContext(UserContext);
  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();

    const fetchCollectionData = async () => {
      try {
        await fetchCollection(
          prodUrl,
          setCollection,
          setError,
          setIsLoading,
          controller.signal,
          collectionId
        );
      } catch (err) {
        setError(getHumanReadableError(err.message));
      }
    };

    fetchCollectionData();

    const intervalId = setInterval(fetchCollectionData, 10000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [collectionId]);

  return (
    <>
      {error ? (
        <ErrorPage err={error} />
      ) : collection && !isLoading ? (
        <>
          <Navbar />

          <CollectionDetails
            collection={collection}
            setCollection={setCollection}
            user={user}
            setError={setError}
          />

          <ItemsDetails items={collection.items} />

          <div className='container'>
            {collection.tags.map((tag, index) => {
              if (index >= 6) {
                return null;
              }
              return (
                <span
                  key={tag._id}
                  className='badge rounded-pill bg-primary me-2 mb-2'
                  style={{ fontSize: '15px' }}
                >
                  {tag.label}
                </span>
              );
            })}
          </div>

          <div
            id='yet-another-enfore-width-95'
            className='container border border-2 rounded-4 p-3 mb-4 mt-2'
          >
            <h2 className='fw-semibold fs-2'>
              <i className='bi bi-chat-text'></i> Comments (
              {collection.comments?.length || 0})
            </h2>

            {collection.comments?.map((comment) => (
              <CommentBox key={comment._id} comment={comment} />
            ))}
            {collection.comments.length ? (
              ''
            ) : (
              <h4 className='mt-3'>Be the first to comment!</h4>
            )}

            {user && (
              <CommentForm
                collectionId={collection._id}
                user={user}
                setCollection={setCollection}
                prodUrl={prodUrl}
              />
            )}
          </div>
        </>
      ) : (
        <LoadingScreen message='Fetching collection data..' />
      )}
    </>
  );
}

function CollectionDetails({ collection, setCollection, user, setError }) {
  const [beenLiked, setBeenLiked] = useState(false);
  const navigate = useNavigate();

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');

  const handleLike = async (event) => {
    try {
      event.target.disabled = true;
      const updatedCount = collection.likesCount + (beenLiked ? -1 : 1);
      setCollection({
        ...collection,
        likesCount: updatedCount
      });
      setBeenLiked(!beenLiked);

      let action = beenLiked ? 'unlike' : 'like';

      const response = await fetch(
        `${prodUrl}/api/collections/${collection._id}/${action}`,
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
        console.log(data);
        setCollection({
          ...collection,
          likesCount: data.likesCount
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (err) {
      setError(getHumanReadableError(err.message));
    } finally {
      event.target.disabled = false;
    }
  };

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
        const data = await response.json();
        console.log(data);
        navigate('/collections');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      setError(getHumanReadableError(err.message));
    }
  };

  return (
    <div
      className='container border border-2 rounded-4 p-3 mb-4 enfore-width-95'
      style={{ marginTop: '130px' }}
      id='enfore-width-95'
    >
      <div className='row'>
        <div className='col-lg-8'>
          <div className='row'>
            <div className='col-9'>
              <h1 className='fs-1'>{collection.name}</h1>
            </div>

            <div className='col-3 d-flex align-items-start justify-content-end'>
              {user && (user._id === collection.user._id || user.isAdmin) && (
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
            by{' '}
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
            <span className='fw-bold'>Items:</span>{' '}
            {Array.isArray(collection.items)
              ? collection.items.length
              : collection.items !== undefined
              ? 1
              : 0}
          </p>

          <p className='mb-2 text-capitalize'>
            <span className='fw-bold'>Category:</span> {collection.category}
          </p>

          <p
            className='text-wrap'
            style={{
              maxHeight: '3.6em'
            }}
          >
            <span className='fw-bold'>Description:</span>{' '}
            {collection.description}
          </p>

          <button
            className='btn btn-outline-primary btn-sm'
            onClick={handleLike}
          >
            <i
              className={`bi ${
                beenLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'
              }`}
            ></i>{' '}
            {collection.likesCount || 0} Likes
          </button>

          <p className='text-body-secondary mt-3 mb-1'>
            <small>Created: {stringifyDate(collection.createdAt)}</small>
          </p>
          <p className='text-body-secondary mb-2'>
            <small>Last Modified: {stringifyDate(collection.updatedAt)}</small>
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

function ItemsDetails({ items }) {
  return (
    <>
      <div className='mt-4'>
        <div
          id='another-enfore-width-95'
          className='container border border-2 rounded-4 p-3 mb-4 mt-2'
        >
          <h2 className='fs-2 fw-semibold'>
            <i className='bi bi-collection fs-3'></i> Items (
            {items?.length || 0})
          </h2>
          <table className='table table-bordered table-striped table-hover w-full mx-auto'>
            <thead>
              <tr>
                <th className='col-6'>Name</th>
                <th className='col-6'>Value</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.client_id}>
                  <td style={{ whiteSpace: 'normal' }}>{item.name}</td>
                  <td style={{ whiteSpace: 'normal' }}>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function CommentBox({ comment }) {
  return (
    <div className='border-top border-bottom p-2 w-100'>
      <div className='d-flex align-items-center'>
        <Link
          to={`/users/${comment.author._id}`}
          className='text-decoration-none'
        >
          <span className='fw-bold text-dark'>{comment.author.username}</span>
        </Link>
        <small className='text-body-secondary'>
          , added {stringifyDate(comment.createdAt || new Date())}
        </small>
      </div>
      <p className='mb-0'>{comment.text}</p>
    </div>
  );
}

function CommentForm({ collectionId, user, setCollection, prodUrl }) {
  const [commentText, setCommentText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('auth');

    try {
      const now = String(new Date());
      setCollection((prevCollection) => ({
        ...prevCollection,
        comments: [
          ...prevCollection.comments,
          {
            _id: uuid(),
            author: user,
            text: commentText,
            collection: prevCollection._id
          }
        ]
      }));
      setCommentText('');
      const response = await fetch(
        `${prodUrl}/api/collections/${collectionId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text: commentText, user: user._id })
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (err) {
      setErrorMessage(getHumanReadableError(err.message));
    }
  };

  return (
    <>
      {errorMessage && <p className='text-danger mt-1'>{errorMessage}</p>}

      <form onSubmit={handleSubmit} className='mb-3 mt-5'>
        <textarea
          className='form-control'
          placeholder='Add a comment...'
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onFocus={() => setErrorMessage('')}
        ></textarea>
        <button type='submit' className='btn btn-primary mt-2'>
          Add Comment
        </button>
      </form>
    </>
  );
}
