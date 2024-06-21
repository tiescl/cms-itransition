import { useState, useEffect, useRef, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Form, InputGroup, Button, Table, Pagination } from 'react-bootstrap';

import ThemeContext from '../../context/ThemeContext.jsx';

import ErrorPage from './ErrorPage';
import InlineLoadingScreen from './InlineLoadingScreen';

export default function SearchPage() {
  const searchInputRef = useRef(null);
  const [reqError, setReqError] = useState('');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchQuery = searchInputRef.current.value;
    if (searchQuery.length === 0) {
      setReqError('empty_search_query');
      return;
    }
    navigate(
      `/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}`
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    navigate(
      `/search?q=${encodeURIComponent(searchParams.get('q'))}&page=${page}`
    );
  };

  const {
    isLoading,
    isError,
    error,
    data: results
  } = useQuery({
    queryKey: ['searchResults', searchParams.get('q'), currentPage],
    queryFn: async () => {
      const response = await fetch(
        `${prodUrl}/api/search?q=${encodeURIComponent(
          searchParams.get('q')
        )}&page=${currentPage}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      const data = await response.json();
      setTotalPages(data.totalPages);
      return data;
    },
    enabled: !!searchParams.get('q')
  });

  useEffect(() => {
    const initialQuery = searchParams.get('q') || '';

    if (searchInputRef.current) {
      searchInputRef.current.value = initialQuery;
    }
    searchInputRef.current.focus();
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
          {reqError && <p className='text-danger fs-5 mt-2'>{t(reqError)}</p>}
        </Form>
      </div>
      {isError ? (
        <ErrorPage err={error} />
      ) : isLoading ? (
        <div className='container'>
          <InlineLoadingScreen message='search.loading' />
        </div>
      ) : (
        <>
          {results && results.results.length === 0 ? (
            <p className='fs-2 px-4 px-md-5 text-info-emphasis'>
              {t('search.noResults')} "{searchParams.get('q')}"
            </p>
          ) : (
            <>
              <p className='fs-2 px-4 px-md-5 mb-4'>
                {t('search.results.thereWas')} {results.totalResults}{' '}
                {results.totalResults === 1
                  ? t('search.results.singular')
                  : t('search.results.plural')}{' '}
                {t('search.results.found')} "{searchParams.get('q')}"
              </p>
              <div className='container-fluid text-center table-responsive px-4 px-md-5'>
                <SearchResultItem results={results?.results || []} />

                <Pagination className='justify-content-center mt-4'>
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
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

function SearchResultItem({ results }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

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
                to={`/collections/${result.collectionId._id}/items/${result._id}`}
                className='text-decoration-none'
              >
                {result.name}
              </Link>
            </td>
            <td>
              <Link
                to={`/users/${result.collectionId.user._id}`}
                className='text-decoration-none text-body-secondary fw-semibold'
              >
                {result.collectionId.user.username}
              </Link>
            </td>
            <td>
              <Link
                to={`/collections/${result.collectionId._id}`}
                className='text-decoration-none'
              >
                {result.collectionId.name}
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
