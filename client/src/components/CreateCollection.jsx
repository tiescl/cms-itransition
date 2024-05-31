import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import categoriesData from '../data/categories.json';
import Navbar from './Navbar.jsx';

export default function CreateCollection() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    customFields: []
  });
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);

  const categories = categoriesData.categories;

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';
  const token = localStorage.getItem('auth');

  const handleCategoryChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      category: e.target.value
    }));
  };

  function handleAddField(type) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      customFields: [
        ...prevFormData.customFields,
        {
          name: '',
          type,
          value: type === 'date' ? new Date().toISOString().slice(0, 10) : ''
        }
      ]
    }));
  }

  const handleRemoveField = (index) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      customFields: prevFormData.customFields.filter((_, i) => i !== index)
    }));
  };

  const handleCustomFieldChange = (index, field, value) => {
    setFormData((prevFormData) => {
      const updatedFields = [...prevFormData.customFields];
      updatedFields[index][field] = value;
      return { ...prevFormData, customFields: updatedFields };
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${prodUrl}/api/collections/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, user: user._id, tags })
      });

      if (response.ok) {
        navigate('/collections');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create a collection');
      }
    } catch (err) {
      console.error(`Error creating a collection: ${err.message}`);
    }
  };

  return (
    <div className='container'>
      <Navbar />
      <h1
        style={{ fontSize: '35px', margin: '110px auto 30px auto' }}
        className='text-center fw-semibold'
      >
        Create Collection
      </h1>
      <form
        style={{ fontSize: '20px', lineHeight: '28px' }}
        className='w-75 mx-auto'
      >
        <div className='mb-4'>
          <label htmlFor='collName' className='form-label'>
            Collection name
          </label>
          <input
            type='text'
            id='collName'
            placeholder='e.g. My Reading List'
            className='form-control'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='description' className='form-label'>
            Collection Description
          </label>
          <textarea
            className='form-control'
            placeholder='Briefly describe what this collection is about'
            rows='5'
            id='description'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='image' className='form-label'>
            Choose an image that represents this collection (JPG, PNG, or GIF
            format)
          </label>
          <input className='form-control form-control' id='image' type='file' />
        </div>
        <div className='mb-4'>
          <label htmlFor='category' className='form-label'>
            Category
          </label>
          <select
            id='category'
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
        <div className='mb-4'>
          {formData.customFields.map((field, index) => {
            console.log(field);
            console.log(index);
            return (
              <div key={index} className='mb-2'>
                <div className='row'>
                  <div className='col-md-4'>
                    <label
                      htmlFor={`fieldName-${index}`}
                      className='form-label'
                    >
                      Field Name: {field}
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id={`fieldName-${index}`}
                      name={`fieldName-${index}`}
                      value={field.name}
                      onChange={(e) =>
                        handleCustomFieldChange(index, 'name', e.target.value)
                      }
                    />
                  </div>
                  <div className='col-md-6'>
                    {field.type === 'string' && (
                      <input
                        type='text'
                        className='form-control'
                        placeholder='Value'
                        value={field.value}
                        onChange={(e) =>
                          handleCustomFieldChange(
                            index,
                            'value',
                            e.target.value
                          )
                        }
                      />
                    )}
                    {field.type === 'number' && (
                      <input
                        type='number'
                        className='form-control'
                        placeholder='Value'
                        value={field.value}
                        onChange={(e) =>
                          handleCustomFieldChange(
                            index,
                            'value',
                            e.target.value
                          )
                        }
                      />
                    )}
                    {field.type === 'date' && (
                      <input
                        type='date'
                        className='form-control'
                        value={field.value}
                        onChange={(e) =>
                          handleCustomFieldChange(
                            index,
                            'value',
                            e.target.value
                          )
                        }
                      />
                    )}
                  </div>
                  <div className='col-md-2'>
                    <button
                      className='btn btn-danger'
                      type='button'
                      onClick={() => handleRemoveField(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className='mb-4'>
          <label htmlFor='customField' className='form-label'>
            Add Collection Field
          </label>
          <div className='input-group'>
            <select className='form-select' id='customField'>
              <option value='string'>Short Text</option>
              <option value='string'>Multiline Text</option>
              <option value='number'>Number</option>
              <option value='date'>Date</option>
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
        <div className='mb-4'>
          <label htmlFor='tagsDataList' className='form-label'>
            Tags
          </label>
          <input
            className='form-control'
            list='tagOptions'
            id='tagsDataList'
            placeholder='Type to search...'
          />
          <datalist id='tagOptions'>
            <option value='San Francisco' />
            <option value='New York' />
            <option value='Seattle' />
            <option value='Los Angeles' />
            <option value='Chicago' />
          </datalist>
        </div>
        <div className='my-5'>
          <button type='submit' className='btn btn-primary form-control'>
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
