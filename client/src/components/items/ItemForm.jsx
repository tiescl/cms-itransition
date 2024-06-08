import { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import Navbar from '../Navbar';

export default function ItemForm({ collectionData, itemData, editMode }) {
  const [formData, setFormData] = useState(() => {
    return {
      name: itemData?.name || '',
      fields:
        itemData?.fields ||
        collectionData.customFieldDefinitions.map((fieldDef) => ({
          client_id: fieldDef.client_id,
          name: fieldDef.name,
          type: fieldDef.type,
          value: ''
        }))
    };
  });

  const [tags, setTags] = useState(itemData?.tags || []);
  const [tagOptions, setTagOptions] = useState([]);

  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [tagError, setTagError] = useState('');

  const handleSubmit = () => {
    return;
  };

  return (
    <>
      <Navbar />

      <div className='container'>
        <FormTitle editMode={editMode} />

        <form style={{ fontSize: '20px' }}>
          <div className='row'>
            <div className='col-md-8 mx-auto'>
              <NameInput formData={formData} setFormData={setFormData} />

              <Items formData={formData} setFormData={setFormData} />

              <TagSelection
                tags={tags}
                setTags={setTags}
                tagOptions={tagOptions}
                setTagOptions={setTagOptions}
                tagError={tagError}
                setTagError={setTagError}
              />

              {error && <h5 className='text-danger mt-2'>{error}</h5>}
              {!error && requestError && (
                <h5 className='text-danger mt-2'>{requestError}</h5>
              )}

              <div className='my-5'>
                <button
                  type='button'
                  onClick={handleSubmit}
                  className='btn btn-primary form-control'
                >
                  {editMode === 'true' ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

function Items({ formData, setFormData }) {
  return (
    <div className='mb-4'>
      {formData.fields.map((field) => {
        return (
          <div key={field.client_id} className='mb-2'>
            <div className='row d-flex justify-content-between align-items-end input-group'>
              <ItemName field={field} />

              <ItemValue field={field} setFormData={setFormData} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ItemValue({ field, setFormData }) {
  const handleFieldChange = (fieldId, value) => {
    setFormData((prevFormData) => {
      const updatedFields = prevFormData.fields.map((field) =>
        field.client_id === fieldId ? { ...field, value: value } : field
      );
      return { ...prevFormData, fields: updatedFields };
    });
  };

  return (
    <div className='col-md-6'>
      <label htmlFor={`fieldValue-${field.client_id}`} className='form-label'>
        Field Value:
      </label>

      <ValueInput
        type={field.type}
        value={field.value}
        id={`fieldValue-${field.client_id}`}
        onChange={(event) => {
          if (field.type === 'checkbox') {
            handleFieldChange(field.client_id, event.target.checked);
          } else {
            handleFieldChange(field.client_id, event.target.value);
          }
        }}
        placeholder='Value'
      />
    </div>
  );
}

function ValueInput({ type, value, onChange, placeholder }) {
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

function ItemName({ field }) {
  return (
    <div className='col-md-4'>
      <label htmlFor={`fieldName-${field.client_id}`} className='form-label'>
        Field Name:
      </label>

      <input
        id={`fieldName-${field.client_id}`}
        type='text'
        className='form-control'
        value={field.name}
        disabled
      />
    </div>
  );
}

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

function FormTitle({ editMode }) {
  return (
    <h1
      style={{ fontSize: '35px', margin: '110px auto 20px auto' }}
      className='text-center fw-semibold'
    >
      {editMode === 'true' ? 'Edit' : 'Create'} Item
    </h1>
  );
}

function NameInput({ formData, setFormData }) {
  return (
    <div className='mb-4'>
      <label htmlFor='collName' className='form-label'>
        Item name
      </label>
      <input
        type='text'
        id='collName'
        className='form-control'
        placeholder='e.g. Shawshank Redemption'
        value={formData.name}
        onChange={(event) =>
          setFormData((prevFormData) => {
            return { ...prevFormData, name: event.target.value.trim() };
          })
        }
      />
    </div>
  );
}
