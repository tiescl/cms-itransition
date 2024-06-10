// item card
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
