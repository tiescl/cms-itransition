import { useState, useEffect, useRef, useContext, FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import SearchResult from '../types/SearchResults';
import Collection from '../types/Collection';
import User from '../types/User';

import {
  Form,
  InputGroup,
  Button,
  Table,
  Pagination
} from 'react-bootstrap';

import ThemeContext from '../context/ThemeContext';

import ErrorPage from '../components/layout/ErrorPage';
import InlineLoadingScreen from '../components/layout/InlineLoadingScreen';

export default function SearchPage() {
  let { t } = useTranslation();
  let navigate = useNavigate();
  let [searchParams] = useSearchParams();

  var searchInputRef = useRef<HTMLInputElement>(null);
  var [reqError, setReqError] = useState('');

  var [currentPage, setCurrentPage] = useState(1);
  var [totalPages, setTotalPages] = useState(0);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  let handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let searchQuery = searchInputRef.current?.value ?? '';
    if (searchQuery.length === 0) {
      setReqError('empty_search_query');
      return;
    }
    navigate(
      `/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}`
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    navigate(
      `/search?q=${encodeURIComponent(searchParams.get('q') ?? '')}&page=${page}`
    );
  };

  var {
    isLoading,
    isError,
    error,
    data: results
  } = useQuery({
    queryKey: ['searchResults', searchParams.get('q'), currentPage],
    queryFn: async () => {
      let response = await fetch(
        `${prodUrl}/api/search?q=${encodeURIComponent(
          searchParams.get('q') ?? ''
        )}&page=${currentPage}`
      );
      if (!response.ok) {
        let errorData = await response.json();
        throw new Error(errorData.error);
      }
      let data = await response.json();
      setTotalPages(data.totalPages);
      return data;
    },
    enabled: !!searchParams.get('q')
  });

  useEffect(() => {
    let initialQuery = searchParams.get('q') ?? '';

    if (searchInputRef.current) {
      searchInputRef.current.value = initialQuery;
    }
    searchInputRef.current?.focus();
  }, [searchParams.get('q')]);

  return (
    <>
      <h1 style={{ marginTop: '125px' }} className='text-center fs-1 mb-5'>
        {t('search.heading')}
      </h1>
      <div className='container-fluid mb-4 px-4 px-md-5'>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Form.Control
              id='search-input'
              type='text'
              placeholder={t('nav.search')}
              ref={searchInputRef}
              onFocus={() => setReqError('')}
            />
            <Button variant='primary' type='submit'>
              <i className='bi bi-search'></i> {t('search.button')}
            </Button>
          </InputGroup>
          {reqError && (
            <p className='text-danger fs-5 mt-2'>{t(reqError)}</p>
          )}
        </Form>
      </div>
      {isError ? (
        <ErrorPage err={error?.message ?? ''} />
      ) : isLoading ? (
        <div className='container'>
          <InlineLoadingScreen message='search.loading' />
        </div>
      ) : (
        <>
          {results && results.results.length == 0 ? (
            <p className='fs-2 px-4 px-md-5 text-info-emphasis'>
              {t('search.noResults')} &quot;{searchParams.get('q')}&quot;
            </p>
          ) : (
            <>
              <p className='fs-2 px-4 px-md-5 mb-4'>
                {t('search.results.thereWas')} {results.totalResults}{' '}
                {results.totalResults == 1
                  ? t('search.results.singular')
                  : t('search.results.plural')}{' '}
                {t('search.results.found')} &quot;{searchParams.get('q')}
                &quot;
              </p>
              <div className='container-fluid text-center table-responsive px-4 px-md-5'>
                <SearchResultItem results={results?.results || []} />

                <Pagination className='justify-content-center mt-4'>
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
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

interface ISearchResultItemProps {
  results: SearchResult[];
}

function SearchResultItem({ results }: ISearchResultItemProps) {
  let { t } = useTranslation();
  let { theme } = useContext(ThemeContext);

  return (
    <Table striped bordered hover>
      <thead className={`table-${theme}`}>
        <tr className='align-middle'>
          <th>{t('search.itemName')}</th>
          <th>{t('search.author')}</th>
          <th>{t('search.collection')}</th>
          <th>{t('search.origin')}</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) => (
          <tr key={result._id} className='align-middle'>
            <td>
              <Link
                to={`/collections/${(result.collectionId as Collection)?._id}/items/${result._id}`}
                className='text-decoration-none'
              >
                {result.name}
              </Link>
            </td>
            <td>
              <Link
                to={`/users/${((result.collectionId as Collection)?.user as User)?._id}`}
                className='text-decoration-none text-body-secondary fw-semibold'
              >
                {
                  ((result.collectionId as Collection)?.user as User)
                    ?.username
                }
              </Link>
            </td>
            <td>
              <Link
                to={`/collections/${(result.collectionId as Collection)?._id}`}
                className='text-decoration-none'
              >
                {(result.collectionId as Collection)?.name}
              </Link>
            </td>
            <td>
              <div>{result.source.join(', ')}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
