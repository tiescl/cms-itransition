import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import categoriesData from '../data/categories.json';
import Navbar from './Navbar.jsx';
import { v4 as uuidv4 } from 'uuid';
import CreatableSelect from 'react-select/creatable';
import getHumanReadableError from '../utils/getHumanReadableError.js';

export default function CreateCollection() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    items: []
  });
  const [tags, setTags] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);

  // MARK: Error States
  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [imageError, setImageError] = useState('');
  const [tagError, setTagError] = useState('');

  const handleDisabled = (formSubmitData) => {
    setError('');
    if (error !== '' || imageError + tagError !== '') {
      return true;
    }

    if (
      !formSubmitData.name ||
      !formSubmitData.category ||
      formSubmitData.items.length === 0
    ) {
      setError('Name, category, and at least one item are required.');
      return true;
    } else {
      setError('');
    }

    for (const item of formSubmitData.items) {
      if (!item.client_id || !item.name || !item.type || !item.value) {
        setError('Item fields (name and value) must not be empty.');
        return true;
      } else {
        setError('');
      }
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const prodUrl =
      import.meta.env.VITE_PRODUCTION_URL ||
      'https://cms-itransition.onrender.com';
    const token = localStorage.getItem('auth');

    if (!handleDisabled(formData)) {
      e.target.disabled = true;
      setRequestError('');

      try {
        if (user === null || user === '') {
          throw new Error('operation_forbidden');
        }
        const response = await fetch(`${prodUrl}/api/collections/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...formData, user: user._id, tags: tags })
        });

        if (response.ok) {
          const newCollection = await response.json();
          console.log(newCollection);
          navigate('/collections');
        } else {
          const errorData = await response.json();
          e.target.disabled = false;
          throw new Error(errorData.error);
        }
      } catch (err) {
        e.target.disabled = false;
        setRequestError(`Error: ${getHumanReadableError(err.message)}`);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className='container-fluid'>
        <CollectionTitle />

        <form style={{ fontSize: '20px' }} onSubmit={handleSubmit}>
          <div className='row'>
            <div className='col-md-8 mx-auto'>
              <NameInput formData={formData} setFormData={setFormData} />

              <DescriptionInput formData={formData} setFormData={setFormData} />

              <ImageInput
                formData={formData}
                setFormData={setFormData}
                imageError={imageError}
                setImageError={setImageError}
              />

              <CategorySelection
                formData={formData}
                setFormData={setFormData}
              />

              <Items formData={formData} setFormData={setFormData} />

              <CreateItem setFormData={setFormData} />

              <TagSelection
                tags={tags}
                setTags={setTags}
                tagOptions={tagOptions}
                setTagOptions={setTagOptions}
                tagError={tagError}
                setTagError={setTagError}
              />

              {error && <h5 className='text-danger mt-2'>{error}</h5>}
              {error === '' && requestError && (
                <h5 className='text-danger mt-2'>{requestError}</h5>
              )}

              <div className='my-5'>
                <button type='submit' className='btn btn-primary form-control'>
                  Create
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

function CollectionTitle() {
  return (
    <h1
      style={{ fontSize: '35px', margin: '110px auto 20px auto' }}
      className='text-center fw-semibold'
    >
      Create Collection
    </h1>
  );
}

function NameInput({ formData, setFormData }) {
  return (
    <div className='mb-4'>
      <label htmlFor='collName' className='form-label'>
        Collection name
      </label>
      <input
        type='text'
        id='collName'
        className='form-control'
        placeholder='e.g. My Reading List'
        value={formData.name}
        onChange={(event) =>
          setFormData((prevFormData) => {
            return { ...prevFormData, name: event.target.value };
          })
        }
      />
    </div>
  );
}

function DescriptionInput({ formData, setFormData }) {
  return (
    <div className='mb-4'>
      <label htmlFor='collDescription' className='form-label'>
        Collection Description
      </label>
      <textarea
        id='collDescription'
        className='form-control'
        placeholder='Briefly describe what this collection is about'
        rows='5'
        value={formData.description}
        onChange={(event) =>
          setFormData((prevFormData) => {
            return { ...prevFormData, description: event.target.value };
          })
        }
      />
    </div>
  );
}

function ImageInput({ formData, setFormData, imageError, setImageError }) {
  const api_key = import.meta.env.VITE_IMGBB_APIKEY;

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!acceptedTypes.includes(file.type) || file.size > 5000000) {
      setImageError(
        'Please select a valid image (JPG/PNG) with a size up to 5mb'
      );
      event.target.value = '';
      return;
    }

    try {
      const formImageData = new FormData();
      formImageData.append('image', file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${api_key}`,
        {
          method: 'POST',
          body: formImageData
        }
      );

      if (response.ok) {
        const data = await response.json();
        setImageError('');
        setFormData((prevFormData) => ({
          ...prevFormData,
          imageUrl: data.data.url
        }));
      } else {
        const data = await response.json();
        event.target.value = '';
        throw new Error(data.error.message);
      }
    } catch (error) {
      setImageError(`Upload failed: ${error.message}`);
    }
  };

  return (
    <div className='mb-4'>
      <label htmlFor='collImage' className='form-label'>
        Choose an image that represents this collection (JPG or PNG format)
      </label>
      <input
        type='file'
        id='collImage'
        className='form-control'
        onChange={handleFileChange}
      />
      {!imageError && formData.imageUrl && (
        <>
          <h5 className='text-success mt-2'>
            Success! View it{' '}
            <a href={formData.imageUrl} className='text-primary'>
              here
            </a>
            .
          </h5>
        </>
      )}
      {imageError && <h5 className='text-danger mt-2'>{imageError}</h5>}
    </div>
  );
}

function CategorySelection({ formData, setFormData }) {
  const categories = categoriesData.categories;

  const handleCategoryChange = (event) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      category: event.target.value
    }));
  };

  return (
    <div className='mb-4'>
      <label htmlFor='collCategory' className='form-label'>
        Category
      </label>
      <select
        id='collCategory'
        className='form-select'
        value={formData.category}
        onChange={handleCategoryChange}
      >
        <option value=''>Select a Category</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}

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

function TagSelection({
  tags,
  setTags,
  tagOptions,
  setTagOptions,
  tagError,
  setTagError
}) {
  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${prodUrl}/api/collections/tags`);
        if (!response.ok) {
          const data = response.json();
          throw new Error(data.error);
        }
        const data = await response.json();
        setTagOptions(
          data.map((tag) => ({ value: tag.value, label: tag.label }))
        );
      } catch (error) {
        setTagError(`Error fetching tag options: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
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
