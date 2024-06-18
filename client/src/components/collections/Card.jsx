import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ThemeContext from '../../context/ThemeContext';

import '../../styles/bootstrp.css';

export default function CollectionCard({ collection }) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const MAX_ITEMS = 3;

  return (
    <div className='col-11 col-md-6 mb-5 mx-auto flex-fill d-flex justify-content-center'>
      <div className='card shadow collection-box flex-fill'>
        <div className='card-img-top' style={{ position: 'relative' }}>
          {collection.imageUrl ? (
            <img
              src={collection.imageUrl}
              className='card-img-top'
              alt={collection.name}
              style={{ objectFit: 'cover', maxHeight: '250px', width: '100%' }}
            />
          ) : (
            <div className='placeholder-image'></div>
          )}
        </div>
        <div className='card-body'>
          <div className='card-header border mb-2 rounded'>
            <Link
              to={`/collections/${collection._id}`}
              className='text-primary text-decoration-none'
            >
              <h5 className='card-title fs-4 fw-bold'>{collection.name}</h5>
            </Link>
            <p className='card-subtitle'>
              <em>
                {t('collection.by')}
                <strong>
                  <Link
                    to={`/users/${collection.user._id}`}
                    className='text-decoration-none text-body-secondary'
                  >
                    {collection.user.username}
                  </Link>
                </strong>
              </em>
            </p>

            <p
              className='card-text'
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {collection.description}
            </p>
          </div>

          {collection.items?.length > 0 && (
            <ul className='list-group list-group-numbered border border-2 rounded list-group-flush'>
              <div className='card-header text-body-secondary fw-bold fs-5'>
                {t('collection.items')}
              </div>
              {collection.items?.slice(0, MAX_ITEMS).map((item) => (
                <li
                  key={item._id}
                  className='list-group-item'
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Link
                    to={`/collections/${collection._id}/items/${item._id}`}
                    className={`text-decoration-none text-${
                      theme === 'light' ? 'dark' : 'light'
                    }`}
                  >
                    <strong>{item.name}</strong>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {collection.items?.length > MAX_ITEMS && (
            <div className='text-end'>
              <Link
                to={`/collections/${collection._id}`}
                className='text-primary fs-6 text-decoration-none me-3'
              >
                {t('collection.seeMore')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
