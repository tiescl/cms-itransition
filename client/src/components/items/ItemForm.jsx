import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CreatableSelect from 'react-select/creatable';

import UserContext from '../../context/UserContext.jsx';
import ThemeContext from '../../context/ThemeContext.jsx';

import '../../styles/bootstrp.css';

export default function ItemForm({ collectionData, itemData, editMode }) {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);

  const [formData, setFormData] = useState(() => {
    const initialFields = collectionData.customFieldDefinitions.map(
      (fieldDef) => ({
        client_id: fieldDef.client_id,
        name: fieldDef.name,
        value:
          itemData?.fields?.find((f) => f.client_id === fieldDef.client_id)
            ?.value || '',
        type: fieldDef.type
      })
    );

    return {
      name: itemData?.name || '',
      fields: initialFields
    };
  });

  const [tags, setTags] = useState(itemData?.tags || []);
  const [tagOptions, setTagOptions] = useState([]);
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [tagError, setTagError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
    const token = localStorage.getItem('auth');

    if (!tagError) {
      e.target.disabled = true;
      setError('');

      try {
        if (
          !formData.name ||
          formData.fields.some((field) => !String(field.value))
        ) {
          throw new Error('name_fields_required');
        }

        if (!user) {
          throw new Error('operation_forbidden');
        }

        const endpoint = itemData
          ? `${prodUrl}/api/collections/${collectionData._id}/items/${itemData._id}`
          : `${prodUrl}/api/collections/${collectionData._id}/items/create`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            name: formData.name.trim(),
            fields: formData.fields.map((field) => {
              return {
                ...field,
                value:
                  field.type !== 'checkbox'
                    ? field.value.trim()
                    : field.value
              };
            }),
            user: user._id,
            collectionId: collectionData._id,
            tags: tags
          })
        });

        if (response.ok) {
          // const newItem = await response.json();
          // console.log(newItem);
          navigate(`/collections/${collectionData._id}`);
        } else {
          const errorData = await response.json();
          e.target.disabled = false;
          throw new Error(errorData.error);
        }
      } catch (err) {
        e.target.disabled = false;
        // console.log(err.message);
        setError(err.message);
      }
    }
  };

  return (
    <>
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

              {error && (
                <h5 className='text-danger mt-2'>
                  {t(error, { defaultValue: t('error.default') })}
                </h5>
              )}

              <div className='my-5'>
                <button
                  type='button'
                  onClick={handleSubmit}
                  className='btn btn-primary form-control'
                >
                  {editMode === true ? t('item.saveEdit') : t('item.save')}
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
  const { t } = useTranslation();

  return (
    <div className='mb-4'>
      <h1 className='fs-3 fw-semibold'>{t('item.details.heading')}</h1>
      {formData.fields.map((field) => {
        return (
          <div key={field.client_id} className='mb-2'>
            <Item field={field} setFormData={setFormData} />
          </div>
        );
      })}
    </div>
  );
}

function Item({ field, setFormData }) {
  const { t } = useTranslation();

  const handleFieldChange = (fieldId, value) => {
    setFormData((prevFormData) => {
      const updatedFields = prevFormData.fields.map((field) =>
        field.client_id === fieldId
          ? {
              ...field,
              value: value
            }
          : field
      );
      return { ...prevFormData, fields: updatedFields };
    });
  };

  return (
    <div className='col-md-9'>
      <div className='row'>
        <div className='col-md-6'>
          <label
            htmlFor={`fieldValue-${field.client_id}`}
            className='form-label'
          >
            {field.name}
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
            placeholder={t('item.field.placeholder')}
          />
        </div>
      </div>
    </div>
  );
}

function ValueInput({ id, type, value, onChange, placeholder }) {
  const inputProps = {
    id: id,
    type: type,
    onChange: onChange,
    className: 'form-control mb-2'
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
    inputProps.className = 'form-check-input mb-2';
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

function TagSelection({
  tags,
  setTags,
  tagOptions,
  setTagOptions,
  tagError,
  setTagError
}) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
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
          setTagError(error.message);
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

  const colourStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: theme,
      borderColor: theme === 'light' ? 'lightgrey' : 'grey'
    }),
    input: (styles) => ({
      ...styles,
      color: theme === 'light' ? 'black' : 'white'
    }),
    option: (styles, { isSelected }) => {
      return {
        ...styles,
        'backgroundColor': isSelected
          ? theme === 'dark'
            ? '#495057'
            : '#007bff'
          : theme === 'dark'
            ? '#343a40'
            : 'white',
        'color': isSelected
          ? 'white'
          : theme === 'dark'
            ? 'white'
            : 'black',
        ':hover': {
          backgroundColor: isSelected
            ? theme === 'dark'
              ? '#495057'
              : '#007bff'
            : theme === 'dark'
              ? '#495057'
              : '#e9ecef'
        }
      };
    },
    multiValueLabel: (styles) => ({
      ...styles,
      color: 'black'
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      'color': 'grey',
      ':hover': {
        backgroundColor: 'lightgrey'
      }
    })
  };

  return (
    <div className='mb-4'>
      <label htmlFor='collTags' className='form-label'>
        {t('tags.heading')}
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
        styles={colourStyles}
      />
      <div className='form-text'>{t('tags.rules')}</div>

      {tagError && (
        <h5 className='text-danger mt-2'>
          {t(tagError, { defaultValue: t('error.default') })}
        </h5>
      )}
    </div>
  );
}

function FormTitle({ editMode }) {
  const { t } = useTranslation();

  return (
    <h1
      style={{ fontSize: '35px', margin: '125px auto 20px auto' }}
      className='text-center fw-semibold'
    >
      {editMode === true ? t('item.edit') : t('item.create')}{' '}
      {t('item.heading')}
    </h1>
  );
}

function NameInput({ formData, setFormData }) {
  const { t } = useTranslation();

  return (
    <div className='mb-4'>
      <label htmlFor='collName' className='form-label'>
        {t('item.name')}
      </label>
      <input
        type='text'
        id='collName'
        className='form-control'
        placeholder={t('item.placeholder')}
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
