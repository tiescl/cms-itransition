function CreateItem({ setFormData }) {
  const [selectedType, setSelectedType] = useState('text');

  const handleAddField = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      items: [
        ...prevFormData.items,
        {
          client_id: uuidv4(),
          type: selectedType,
          name: '',
          value: ''
        }
      ]
    }));
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  return (
    <div className='mb-4'>
      <label htmlFor='collitem' className='form-label'>
        Add Collection Field
      </label>

      <div className='input-group'>
        <select
          className='form-select'
          id='collitem'
          value={selectedType}
          onChange={handleTypeChange}
        >
          <option value='text'>Short Text</option>
          <option value='number'>Number</option>
          <option value='date'>Date</option>
          <option value='checkbox'>Checkbox (Yes/No)</option>
          <option value='multiline_string'>Multiline Text</option>
        </select>
        <button
          className='btn btn-primary'
          type='button'
          onClick={handleAddField}
        >
          Add Field
        </button>
      </div>
    </div>
  );
}

function Items({ formData, setFormData }) {
  const handleItemFieldChange = (fieldId, field, value) => {
    setFormData((prevFormData) => {
      const updatedItems = prevFormData.items.map((item) =>
        item.client_id === fieldId ? { ...item, [field]: value } : item
      );
      return { ...prevFormData, items: updatedItems };
    });
  };

  return (
    <div className='mb-4'>
      {formData.items.map((item) => {
        return (
          <div key={item.client_id} className='mb-2'>
            <div className='row d-flex justify-content-between align-items-end'>
              <ItemName item={item} onItemFieldChange={handleItemFieldChange} />

              <ItemValue
                item={item}
                onItemFieldChange={handleItemFieldChange}
              />

              <ItemRemoveButton
                itemId={item.client_id}
                setFormData={setFormData}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ItemName({ item, onItemFieldChange }) {
  return (
    <div className='col-md-4'>
      <label htmlFor={`itemName-${item.client_id}`} className='form-label'>
        Item Name:
      </label>

      <input
        id={`itemName-${item.client_id}`}
        type='text'
        className='form-control'
        placeholder='Name'
        value={item.name}
        onChange={(event) =>
          onItemFieldChange(item.client_id, 'name', event.target.value)
        }
      />
    </div>
  );
}

function ItemValue({ item, onItemFieldChange }) {
  return (
    <div className='col-md-6'>
      <label htmlFor={`itemValue-${item.client_id}`} className='form-label'>
        Item Value:
      </label>

      <ItemValueInput
        type={item.type}
        value={item.value}
        id={`itemValue-${item.client_id}`}
        onChange={(event) => {
          if (item.type === 'checkbox') {
            onItemFieldChange(item.client_id, 'value', event.target.checked);
          } else {
            onItemFieldChange(item.client_id, 'value', event.target.value);
          }
        }}
        placeholder='Value'
      />
    </div>
  );
}

function ItemValueInput({ type, value, onChange, placeholder }) {
  const inputProps = {
    type: type,
    onChange: onChange,
    className: 'form-control'
  };

  if (type !== 'checkbox') {
    inputProps.value = value;
  }
  if (type !== 'date' && type !== 'checkbox') {
    inputProps.placeholder = placeholder;
  }
  if (type === 'multiline_string') {
    return <textarea {...inputProps} rows={1} />;
  }
  if (type === 'checkbox') {
    inputProps.className = 'form-check-input';
    inputProps.checked = Boolean(value);
    return (
      <input
        {...inputProps}
        style={{
          height: '25px',
          width: '25px',
          marginBottom: '7px',
          display: 'block'
        }}
      />
    );
  }

  return <input {...inputProps} />;
}

function ItemRemoveButton({ itemId, setFormData }) {
  const handleRemoveItem = (itemUniqueId) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      items: prevFormData.items.filter(
        (item) => item.client_id !== itemUniqueId
      )
    }));
  };

  return (
    <div className='col-md-2'>
      <div className='text-end'>
        <button
          className='btn btn-danger mt-2'
          type='button'
          onClick={() => handleRemoveItem(itemId)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

import CreatableSelect from 'react-select/creatable';

const [tags, setTags] = useState(collectionData?.tags || []);
const [tagOptions, setTagOptions] = useState([]);

const [tagError, setTagError] = useState('');

// handleSubmit
tags: tags;
function TagSelection({
  tags,
  setTags,
  tagOptions,
  setTagOptions,
  tagError,
  setTagError
}) {
  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${prodUrl}/api/collections/tags`, {
          signal: controller.signal
        });
        if (!response.ok) {
          const data = response.json();
          throw new Error(data.error);
        }
        const data = await response.json();
        setTagOptions(
          data.map((tag) => ({ value: tag.value, label: tag.label }))
        );
      } catch (error) {
        if (error.name !== 'AbortError') {
          setTagError(getHumanReadableError(error.message));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();

    return () => controller.abort();
  }, []);

  const createOption = (label) => {
    let baseLabel = label.replace(/\W/g, '');
    let finalLabel = baseLabel.slice(0, Math.min(baseLabel.length, 50));
    return {
      label: `#${finalLabel}`,
      value: finalLabel
    };
  };

  const handleCreateOption = (inputValue) => {
    const newOption = createOption(inputValue);
    setTags((prev) => [...prev, newOption]);
  };

  return (
    <div className='mb-4'>
      <label htmlFor='collTags' className='form-label'>
        Tags
      </label>

      <CreatableSelect
        id='collTags'
        isMulti
        isClearable
        isDisabled={isLoading}
        isLoading={isLoading}
        options={tagOptions}
        value={tags}
        onChange={(newValue) => {
          setTags(newValue);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
          }
        }}
        onCreateOption={handleCreateOption}
      />
      <div className='form-text'>
        Tags must not contain spaces, and must not exceed 50 characters
      </div>

      {tagError && <h5 className='text-danger mt-2'>{tagError}</h5>}
    </div>
  );
}

{
  /* <TagSelection
  tags={tags}
  setTags={setTags}
  tagOptions={tagOptions}
  setTagOptions={setTagOptions}
  tagError={tagError}
  setTagError={setTagError}
/>; */
}
