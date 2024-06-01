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
    items: []
  });
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';
  const token = localStorage.getItem('auth');

  const handleItemFieldChange = (index, field, value) => {
    setFormData((prevFormData) => {
      const updatedItems = [...prevFormData.items];
      updatedItems[index][field] = value;
      return { ...prevFormData, items: updatedItems };
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
    <>
      <Navbar />
      <div className='container-fluid'>
        <CollectionTitle />

        <form style={{ fontSize: '20px' }}>
          <div className='row'>
            <div className='col-md-8 mx-auto'>
              <NameInput />

              <DescriptionInput />

              <ImageInput />

              <CategorySelection
                formData={formData}
                setFormData={setFormData}
              />

              <Items
                formData={formData}
                onItemFieldChange={handleItemFieldChange}
                setFormData={setFormData}
              />

              <CreateItem setFormData={setFormData} />

              <TagSelection />

              <SubmitButton />
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

function NameInput() {
  return (
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
  );
}

function DescriptionInput() {
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
      />
    </div>
  );
}

function ImageInput() {
  return (
    <div className='mb-4'>
      <label htmlFor='collImage' className='form-label'>
        Choose an image that represents this collection (JPG, PNG, or GIF
        format)
      </label>
      <input type='file' id='collImage' className='form-control form-control' />
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

function TagSelection() {
  return (
    <div className='mb-4'>
      <label htmlFor='collTagsDatalist' className='form-label'>
        Tags
      </label>
      <input
        id='collTagsDatalist'
        className='form-control'
        list='tagOptions'
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
  );
}

function SubmitButton() {
  return (
    <div className='my-5'>
      <button type='submit' className='btn btn-primary form-control'>
        Create
      </button>
    </div>
  );
}

function Items({ formData, onItemFieldChange, setFormData }) {
  return (
    <div className='mb-4'>
      {formData.items.map((item, index) => {
        return (
          <div key={index} className='mb-2'>
            <div className='row d-flex justify-content-between align-items-end'>
              <ItemName
                item={item}
                index={index}
                onChange={onItemFieldChange}
              />

              <ItemValue
                item={item}
                index={index}
                onIndividualFieldTypeChange={onItemFieldChange}
              />

              <ItemRemoveButton index={index} setFormData={setFormData} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ItemName({ item, index, onChange }) {
  return (
    <div className='col-md-4'>
      <label htmlFor={`itemName-${index}`} className='form-label'>
        Item Name:
      </label>

      <input
        id={`itemName-${index}`}
        type='text'
        className='form-control'
        placeholder='Name'
        value={item.name}
        onChange={(event) => onChange(index, 'name', event.target.value)}
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

  if (type !== 'date' && type !== 'checkbox') {
    inputProps.placeholder = placeholder;
    inputProps.value = value;
  }
  if (type === 'multiline_string') {
    return <textarea {...inputProps} rows={1} />;
  }
  if (type === 'checkbox') {
    inputProps.className = 'form-check';
  }

  return <input {...inputProps} />;
}

function ItemValue({ item, index, onIndividualFieldTypeChange }) {
  return (
    <div className='col-md-6'>
      <label htmlFor={`itemName-${index}`} className='form-label'>
        Item Value:
      </label>

      <ItemValueInput
        type={item.type}
        value={item.value}
        onChange={(event) =>
          onIndividualFieldTypeChange(index, 'value', event.target.value)
        }
        placeholder='Value'
      />
    </div>
  );
}

function ItemRemoveButton({ index, setFormData }) {
  const handleRemoveItem = (itemIndex) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      items: prevFormData.items.filter(
        (_, indexOfItem) => indexOfItem !== itemIndex
      )
    }));
  };

  return (
    <div className='col-md-2'>
      <div className='text-end'>
        <button
          className='btn btn-danger mt-2'
          type='button'
          onClick={() => handleRemoveItem(index)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
