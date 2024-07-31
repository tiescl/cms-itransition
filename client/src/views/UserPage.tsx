import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import UserContext from '../context/UserContext';

import ErrorPage from '../components/layout/ErrorPage';
import LoadingScreen from '../components/layout/LoadingScreen';
import InlineLoadingScreen from '../components/layout/InlineLoadingScreen';
import CollectionCard from '../components/collections/Card.jsx';
import { Pagination } from 'react-bootstrap';

import JiraTickets from '../components/users/UserTickets';
import UserDetails from '../components/users/UserDetails';

import User from '../types/User.js';
import JiraIssue from '../types/JiraIssue.js';
import Collection from '../types/Collection.js';

export default function UserPage() {
  let { t } = useTranslation();
  let { userId } = useParams();
  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');

  var { user } = useContext(UserContext);

  var [pageUser, setPageUser] = useState<User | null>(null),
    [issues, setIssues] = useState<JiraIssue[]>([]),
    [error, setError] = useState(''),
    [totalPages, setTotalPages] = useState(0),
    [currentPage, setCurrentPage] = useState(1);

  var { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      try {
        let response = await fetch(`${prodUrl}/api/users/${userId}`);
        if (response.ok) {
          return await response.json();
        } else {
          let errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        console.log((err as Error).message);
        setError((err as Error).message);
      }
    },
    staleTime: 10 * 1000,
    gcTime: 20 * 60 * 1000
  });

  useEffect(() => {
    setPageUser(data);
  }, [data]);

  let { data: tickets, isLoading } = useQuery({
    queryKey: ['jiraTickets', user, userId, currentPage],
    queryFn: async () => {
      try {
        let response = await fetch(
          `${prodUrl}/api/users/${userId}/tickets?startAt=${
            (currentPage - 1) * 10
          }`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (response.ok) {
          return await response.json();
        } else {
          let errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        console.log((err as Error).message);
        setError((err as Error).message);
        throw err;
      }
    },
    staleTime: 10 * 1000,
    gcTime: 20 * 60 * 1000,
    enabled: user?._id == userId
  });

  useEffect(() => {
    setTotalPages(Math.ceil(tickets?.total / 10));
    setIssues(tickets?.issues || []);
  }, [tickets]);

  let handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return error ? (
    <ErrorPage err={error} />
  ) : pageUser ? (
    <>
      <UserDetails
        pageUser={pageUser}
        contextUser={user}
        setError={setError}
      />

      {user?._id == userId && (
        <div
          className='container border border-2 rounded-4 p-3 mb-4 table-responsive'
          id='enforce-width-95-user0'
        >
          <>
            <h1 className='mb-4'>
              <i className='bi bi-ticket-perforated'></i>{' '}
              {t('user.jiraHeading')}
            </h1>
            {issues ? (
              <>
                <JiraTickets issues={issues} isLoading={isLoading} />

                <Pagination className='justify-content-center'>
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage == 1}
                  />
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 == currentPage}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage == totalPages}
                  />
                </Pagination>
              </>
            ) : (
              <InlineLoadingScreen message='inlineLoading.tickets' />
            )}
          </>
        </div>
      )}

      <div
        className='container border border-2 rounded-4 p-3 mb-4'
        id='enforce-width-95-user0'
      >
        <h1 className='mb-4'>
          <i className='bi bi-collection'></i> {t('user.collections')} (
          {pageUser.collections?.length})
        </h1>
        <div className='row d-flex'>
          {(pageUser.collections as Collection[]).map((collection) => {
            return (
              <CollectionCard
                key={collection._id}
                collection={collection}
              />
            );
          })}
        </div>
      </div>
    </>
  ) : (
    <LoadingScreen message='loading.user' long={true} />
  );
}
