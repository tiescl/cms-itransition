import { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserContext from '../../context/UserContext.jsx';

import Navbar from '../Navbar.jsx';

import { v4 as uuidv4 } from 'uuid';
import getHumanReadableError from '../../utils/getHumanReadableError.js';
import categoriesData from '../../data/categories.json';
import getFieldType from '../../utils/getFieldType.js';

export default function CollectionForm({
  collectionData = null,
  editMode = false
}) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { collectionId } = useParams();
  const [formData, setFormData] = useState({
    name: collectionData?.name || '',
    description: collectionData?.description || '',
    category: collectionData?.category || '',
    imageUrl: collectionData?.imageUrl || '',
    customFieldDefinitions: collectionData?.customFieldDefinitions || []
  });

  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [imageError, setImageError] = useState('');

  const handleDisabled = (formSubmitData) => {
    setError('');
    if (error || imageError) {
      return true;
    }

    if (
      !formSubmitData.name ||
      !formSubmitData.name.match(/^[A-Za-z][A-Za-z0-9\s]*$/) ||
      !formSubmitData.category ||
      formSubmitData.customFieldDefinitions.length === 0
    ) {
      setError('Name, category, and at least one custom field are required.');
      return true;
    } else {
      setError('');
    }

    for (const field of formSubmitData.customFieldDefinitions) {
      if (!field.client_id || !field.name || !field.type) {
        setError('Custom field name must not be empty.');
        return true;
      } else {
        setError('');
      }
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
    const token = localStorage.getItem('auth');

    if (!handleDisabled(formData)) {
      e.target.disabled = true;
      setRequestError('');

      try {
        if (user === null || user === '') {
          throw new Error('operation_forbidden');
        }

        const endpoint = collectionId
          ? `${prodUrl}/api/collections/${collectionId}`
          : `${prodUrl}/api/collections/create`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...formData, user: user._id })
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
      <div className='container'>
        <FormTitle editMode={editMode} />

        <form style={{ fontSize: '20px' }}>
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

              {formData.customFieldDefinitions.length ? (
                <Fields formData={formData} setFormData={setFormData} />
              ) : null}

              <CreateField setFormData={setFormData} />

              {error && <h5 className='text-danger mt-2'>{error}</h5>}
              {error === '' && requestError && (
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

function FormTitle({ editMode }) {
  return (
    <h1
      style={{ fontSize: '35px', margin: '110px auto 20px auto' }}
      className='text-center fw-semibold'
    >
      {editMode === 'true' ? 'Edit' : 'Create'} Collection
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
            return { ...prevFormData, name: event.target.value.trim() };
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
      {formData.imageUrl ? (
        <img
          src={formData.imageUrl}
          className='float-start img-thumbnail'
          style={{ display: 'block', width: '400px' }}
        ></img>
      ) : (
        ''
      )}
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

function CreateField({ setFormData }) {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('text');

  const handleAddField = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      customFieldDefinitions: [
        ...prevFormData.customFieldDefinitions,
        {
          client_id: uuidv4(),
          name: fieldName.trim(),
          type: fieldType
        }
      ]
    }));

    setFieldName('');
    setFieldType('text');
  };

  return (
    <div className='mb-4'>
      <label htmlFor='field-name' className='form-label'>
        Add Custom Fields
      </label>
      <div className='input-group'>
        <input
          type='text'
          className='form-control'
          id='field-name'
          value={fieldName}
          placeholder='Field Name'
          onChange={(e) => setFieldName(e.target.value)}
        />
        <select
          className='form-select'
          id='field-type'
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value)}
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
          disabled={!fieldName}
        >
          Add Field
        </button>
      </div>
    </div>
  );
}

function Fields({ formData, setFormData }) {
  return (
    <div className='mb-3 container border border-2 rounded-2 table-responsive p-2 mt-5'>
      <table
        className='table table-hover table-sm'
        style={{ fontSize: '18px' }}
      >
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {formData.customFieldDefinitions?.map((field, index) => (
            <tr key={field.client_id} className='align-middle'>
              <td>{index + 1}</td>
              <td>{field.name}</td>
              <td>{getFieldType(field.type)}</td>
              <td>
                {
                  <RemoveButton
                    fieldId={field.client_id}
                    setFormData={setFormData}
                  />
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RemoveButton({ fieldId, setFormData }) {
  const handleRemoveField = (fieldUniqueId) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      customFieldDefinitions: prevFormData.customFieldDefinitions.filter(
        (field) => field.client_id !== fieldUniqueId
      )
    }));
  };

  return (
    <div className='text-start'>
      <button
        className='btn ps-0 text-danger fw-semibold'
        type='button'
        onClick={() => handleRemoveField(fieldId)}
      >
        Remove
      </button>
    </div>
  );
}
