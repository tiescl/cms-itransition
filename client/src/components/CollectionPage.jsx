import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserContext from '../context/UserContext.jsx';
import getHumanReadableError from '../utils/getHumanReadableError.js';
import stringifyDate from '../utils/stringifyDate.js';
import '../styles/bootstrp.css';
import LoadingScreen from './LoadingScreen.jsx';
import Navbar from './Navbar.jsx';
import 'bootstrap-icons/font/bootstrap-icons.min.css';

export default function CollectionPage() {
  const { collectionId } = useParams();
  const { user } = useContext(UserContext);
  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [requestError, setRequestError] = useState('');

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';

  useEffect(() => {
    setIsLoading(true);
    let isMounted = true;
    const fetchCollection = async () => {
      try {
        const response = await fetch(
          `${prodUrl}/api/collections/${collectionId}`
        );
        if (response.ok && isMounted) {
          const data = await response.json();
          setCollection(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        if (isMounted) {
          setRequestError(`Error: ${getHumanReadableError(err.message)}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchCollection();

    const intervalId = setInterval(fetchCollection, 10000);

    return () => {
      clearInterval(intervalId);
      isMounted = false;
    };
  }, [collectionId]);

  return (
    <>
      {collection && !isLoading ? (
        <>
          <Navbar />
          <ErrorAlert
            requestError={requestError}
            setRequestError={setRequestError}
          />
          <CollectionDetails
            collection={collection}
            setCollection={setCollection}
            user={user}
            setRequestError={setRequestError}
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
            <h2 className='fw-bold fs-1'>Comments</h2>

            {collection.comments?.map((comment) => (
              <CommentBox
                key={comment._id}
                comment={{
                  ...comment,
                  timestamp: comment.timestamp
                  // timestamp: stringifyDate(comment.timestamp)
                }}
              />
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

function ErrorAlert({ requestError, setRequestError }) {
  if (requestError) {
    return (
      <div
        className='alert alert-warning alert-dismissible w-full fade show'
        role='alert'
      >
        {requestError}. Try refreshing the page.
        <button
          type='button'
          className='btn-close'
          data-bs-dismiss='alert'
          onClick={() => setRequestError('')}
          aria-label='Close'
        ></button>
      </div>
    );
  }
}

function CollectionDetails({
  collection,
  setCollection,
  user,
  setRequestError
}) {
  const [beenLiked, setBeenLiked] = useState(false);
  const navigate = useNavigate();

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';
  const token = localStorage.getItem('auth');

  const handleLike = async (event) => {
    try {
      event.target.disabled = true;
      const updatedCount = collection.likesCount + (beenLiked ? -1 : 1);
      console.log(collection);
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
      setRequestError(getHumanReadableError(err.message));
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
      setRequestError(getHumanReadableError(err.message));
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
            <div className='col-lg-9'>
              <h1 className='fs-1'>{collection.name}</h1>
            </div>

            <div className='col-lg-3 d-flex align-items-top justify-content-end'>
              {user && (user._id === collection.user._id || user.isAdmin) && (
                <>
                  <Link to={`/collections/${collection._id}/edit`}>
                    <button className='btn btn-primary mt-3 me-2'>
                      <i className='bi bi-pencil-square'></i>
                    </button>
                  </Link>

                  <Link to='/collections'>
                    <button
                      className='btn btn-danger mt-3'
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
            <span className='fw-bold'>TL;DR:</span> {collection.description}
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

          <p className='text-body-secondary mt-2'>
            {/* <small>Created: {stringifyDate(collection.createdAt)}</small> */}
            {/* <small>Created: {collection.createdAt}</small> */}
          </p>
          <p className='text-body-secondary'>
            {/* <small>
              Last Modified: {stringifyDate(collection.lastModified)}
              Last Modified: {collection.lastModified}
            </small> */}
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
          <h2 className='fw-bold fs-1'>Items</h2>
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
        <span className='fw-bold me-2'>{comment.author.username}</span>
        <small className='text-body-secondary'>{comment.timestamp}</small>
      </div>
      <p className='mb-0'>{comment.text}</p>
    </div>
  );
}

function CommentForm({ collectionId, user, setCollection }) {
  const [commentText, setCommentText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';

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
            author: user,
            text: commentText,
            collection: prevCollection._id,
            timestamp: now
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
