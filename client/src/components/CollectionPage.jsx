import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import UserContext from '../context/UserContext.jsx';
import getHumanReadableError from '../utils/getHumanReadableError.js';
import LoadingScreen from './LoadingScreen.jsx';
import '../styles/bootstrp.css';

export default function CollectionPage() {
  const { collectionId } = useParams();
  const { user } = useContext(UserContext);
  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);
  const [requestError, setRequestError] = useState(null);

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';
  const token = localStorage.getItem('auth');

  useEffect(() => {
    const fetchCollection = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${prodUrl}/api/collections/${collectionId}`
        );
        if (response.ok) {
          const data = await response.json();
          setCollection(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        setRequestError(`Error: ${getHumanReadableError(err.message)}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollection();

    const intervalId = setInterval(fetchCollection, 20000);

    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) return <LoadingScreen />;
  if (requestError !== '') {
    return (
      <div className='alert alert-danger'>
        {requestError}. Try refreshing the page.
      </div>
    );
  }

  console.log(collection);

  return (
    <div className='container mt-5'>
      {/* Header Section */}
      <h1 className='display-4 mb-3'>{collection.name}</h1>
      <p className='lead'>by {collection.user?.username || 'Unknown User'}</p>
      {/* Display author/user */}
      {/* ... (Category, image, date, likes) ... */}
      {/* Item List Section */}
      {/* Use a table or grid to display collection.items */}
      {/* ... */}
      {/* Tag List Section */}
      {/* ... display collection.tags as pills or badges ... */}
      {/* Comment Section */}
      <hr />
      <h3>Comments</h3>
      {/* ... display collection.comments ... */}
      {user && <CommentForm collectionId={id} />}
    </div>
  );
}

function ItemsTable() {
  return <></>;
}

function CommentForm() {
  return <></>;
}
