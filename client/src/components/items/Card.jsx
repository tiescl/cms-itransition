import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MAX_FIELDS = 3;

export default function ItemCard({ item }) {
  return (
    <div className='m-5'>
      <div className='card shadow item-box'>
        <div className='card-body'>
          <Header item={item} />

          <Fields
            fields={item.fields}
            collectionId={item.collectionId._id}
            itemId={item._id}
          />

          <Tags tags={item.tags} />
        </div>
      </div>
    </div>
  );
}

function Header({ item }) {
  const { t } = useTranslation();

  return (
    <div className='card-header border mb-2 rounded'>
      <div className='row flex-nowrap'>
        <div className='col-10 d-flex flex-column'>
          <Link
            to={`/collections/${item.collectionId._id}/items/${item._id}`}
            className='text-primary text-decoration-none'
          >
            <h5
              className='card-title fs-4 fw-bold'
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {item.name}
            </h5>
          </Link>
          <p
            className='card-subtitle'
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            <em>
              {t('item.location.small')}{' '}
              <strong>
                <Link
                  to={`/collections/${item.collectionId._id}`}
                  className='text-decoration-none text-body-secondary'
                >
                  {item.collectionId.name}
                </Link>
              </strong>
            </em>
          </p>
        </div>

        <div className='col-2 d-flex align-items-center justify-content-end text-primary'>
          <i className='bi bi-heart-fill'></i>&nbsp;{item.likes.length}
        </div>
      </div>
    </div>
  );
}

function Fields({ fields, collectionId, itemId }) {
  const { t } = useTranslation();

  return (
    <>
      <ul className='list-group border border-2 rounded list-group-flush'>
        <div className='card-header text-body-secondary fw-bold fs-5'>
          {t('item.fields')}
        </div>
        {fields.slice(0, MAX_FIELDS).map((field) => {
          if (field.type !== 'multiline_string') {
            return (
              <li
                key={field.client_id}
                className='list-group-item d-flex flex-nowrap align-items-center py-0 px-2'
              >
                <div className='py-2' style={{ width: '40%' }}>
                  <strong>{field.name}</strong>
                </div>
                <div className='vr'></div>
                <div
                  className='py-2 ps-1 text-start'
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '60%'
                  }}
                >
                  {field.value === 'true'
                    ? `${t('fields.true')} ✅`
                    : field.value === 'false'
                    ? `${t('fields.false')} ❌`
                    : field.value}
                </div>
              </li>
            );
          }
        })}
      </ul>
      <div className='text-end mt-1'>
        <Link
          to={`/collections/${collectionId}/items/${itemId}`}
          className='text-primary text-decoration-none me-3'
        >
          {t('item.seeMore')}
        </Link>
      </div>
    </>
  );
}

function Tags({ tags }) {
  return (
    <div style={{ height: '3em' }} className='overflow-y-scroll'>
      <div
        style={{ lineHeight: '1.5', maxheight: '3em' }}
        className='mt-1 d-flex flex-wrap'
      >
        {tags?.map((tag) => {
          return (
            <span
              key={tag._id}
              className='badge rounded-pill bg-primary me-2 mb-1'
            >
              {tag.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
