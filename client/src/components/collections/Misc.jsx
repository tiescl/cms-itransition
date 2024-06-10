// item card: tags
<div style={{ lineHeight: '1.2' }} className='mt-3'>
  {collection.tags.map((tag, index) => {
    if (index >= 6) {
      return null;
    }
    return (
      <span key={tag._id} className='badge rounded-pill bg-primary me-2 mb-1'>
        {tag.label}
      </span>
    );
  })}
</div>;

// item card: fields
{
  collection.items && (
    <ul className='list-group border border-2 rounded list-group-flush'>
      <div className='card-header text-secondary fw-bold fs-5'>Items</div>
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
          <strong>{item.name}</strong> :{' '}
          {item.value === 'true'
            ? 'Yes ✅'
            : item.value === 'false'
            ? 'No ❌'
            : item.value}
        </li>
      ))}
    </ul>
  );
}
