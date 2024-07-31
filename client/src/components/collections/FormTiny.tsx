import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { v4 as uuidv4 } from 'uuid';
import categoriesData from '../../data/categories.json';
import getFieldType from '../../utils/getFieldType';
import IFormData from '../../types/FormData';
import { TFunction } from 'i18next';

interface IFormTitleProps {
  editMode: boolean;
}

function FormTitle({ editMode }: IFormTitleProps) {
  let { t } = useTranslation();

  return (
    <h1
      style={{ fontSize: '35px', margin: '120px auto 20px auto' }}
      className='text-center fw-semibold'
    >
      {editMode == true ? t('collection.edit') : t('collection.create')}
      {t('collection.heading')}
    </h1>
  );
}

interface IFormDataStateProps {
  formData: IFormData;
  setFormData: React.Dispatch<React.SetStateAction<IFormData>>;
}

function NameInput({ formData, setFormData }: IFormDataStateProps) {
  const { t } = useTranslation();

  return (
    <div className='mb-4'>
      <label htmlFor='collName' className='form-label'>
        {t('collection.name')}
      </label>
      <input
        type='text'
        id='collName'
        className='form-control'
        placeholder={t('collection.namePlaceholder')}
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

function DescriptionInput({ formData, setFormData }: IFormDataStateProps) {
  const { t } = useTranslation();

  return (
    <div className='mb-4'>
      <label htmlFor='collDescription' className='form-label'>
        {t('collection.description')}
      </label>
      <textarea
        id='collDescription'
        className='form-control'
        placeholder={t('collection.descriptionPlaceholder')}
        rows={5}
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

interface IImageInputProps extends IFormDataStateProps {
  imageError: string;
  setImageError: React.Dispatch<React.SetStateAction<string>>;
}

function ImageInput({
  formData,
  setFormData,
  imageError,
  setImageError
}: IImageInputProps) {
  let { t } = useTranslation();
  const api_key = import.meta.env.VITE_IMGBB_APIKEY;

  let handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    let files = event.currentTarget.files;
    var file;
    if (files && files.length > 0) {
      file = files[0];
    }
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (
      !file ||
      !acceptedTypes.includes(file.type) ||
      file.size > 5000000
    ) {
      setImageError('image.invalid');
      event.target.value = '';
      return;
    }

    try {
      let formImageData = new FormData();
      formImageData.append('image', file);

      let response = await fetch(
        `https://api.imgbb.com/1/upload?key=${api_key}`,
        {
          method: 'POST',
          body: formImageData
        }
      );

      if (response.ok) {
        let data = await response.json();
        setImageError('');
        setFormData((prevFormData) => ({
          ...prevFormData,
          imageUrl: data.data.url
        }));
      } else {
        let data = await response.json();
        event.target.value = '';
        throw new Error(data.error.message);
      }
    } catch (error) {
      console.error((error as Error)?.message ?? '');
      setImageError((error as Error)?.message ?? '');
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
        {t('collection.image')}
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
            {t('image.success')}
            <a
              href={formData.imageUrl}
              className='text-primary text-decoration-none'
            >
              {t('image.link')}
            </a>
            .
          </h5>
        </>
      )}
      {imageError && (
        <h5 className='text-danger mt-2'>
          {t(imageError, { defaultValue: t('error.default') })}
        </h5>
      )}
    </div>
  );
}

function CategorySelection({
  formData,
  setFormData
}: IFormDataStateProps) {
  let { t } = useTranslation();
  let categories = categoriesData.categories;

  let handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      category: event.target.value
    }));
  };

  return (
    <div className='mb-4'>
      <label htmlFor='collCategory' className='form-label'>
        {t('collection.category')}
      </label>
      <select
        id='collCategory'
        className='form-select'
        value={formData.category}
        onChange={handleCategoryChange}
      >
        <option value=''>{t('category.defOption')}</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ICreateFieldProps {
  setFormData: React.Dispatch<React.SetStateAction<IFormData>>;
}
function CreateField({ setFormData }: ICreateFieldProps) {
  let { t } = useTranslation();

  var [fieldName, setFieldName] = useState('');
  var [fieldType, setFieldType] = useState('text');

  let handleAddField = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      customFieldDefinitions: [
        ...prevFormData.customFieldDefinitions,
        {
          _id: uuidv4(),
          // COLLECTION_DUMP_TODO: Def needs to be removed
          client_id: uuidv4(),
          name: fieldName,
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
        {t('collection.customFields')}
      </label>
      <div className='input-group'>
        <input
          type='text'
          className='form-control'
          id='field-name'
          value={fieldName}
          placeholder={t('customFields.placeholder')}
          onChange={(e) => setFieldName(e.target.value)}
        />
        <select
          className='form-select'
          id='field-type'
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value)}
        >
          <option value='text'>{t('fieldtype.text')}</option>
          <option value='number'>{t('fieldtype.number')}</option>
          <option value='date'>{t('fieldtype.date')}</option>
          <option value='checkbox'>{t('fieldtype.checkbox')}</option>
          <option value='multiline_string'>
            {t('fieldtype.multiline_string')}
          </option>
        </select>
        <button
          className='btn btn-primary'
          type='button'
          onClick={handleAddField}
          disabled={!fieldName}
        >
          {t('customFields.button')}
        </button>
      </div>
    </div>
  );
}

function Fields({ formData, setFormData }: IFormDataStateProps) {
  let { t } = useTranslation();

  if (formData.customFieldDefinitions.length == 0) {
    return null;
  }

  return (
    <div className='mb-3 container border border-2 rounded-2 table-responsive p-2 mt-5'>
      <table
        className='table table-hover table-sm'
        style={{ fontSize: '18px' }}
      >
        <thead>
          <tr>
            <th>#</th>
            <th>{t('field.name')}</th>
            <th>{t('field.type')}</th>
            <th>{t('field.action')}</th>
          </tr>
        </thead>
        <tbody>
          {formData.customFieldDefinitions?.map((field, index) => (
            <tr key={field.client_id} className='align-middle'>
              <td>{index + 1}</td>
              <td>{field.name}</td>
              <td>{getFieldType(field.type, t)}</td>
              <td>
                {
                  <RemoveButton
                    fieldId={field.client_id}
                    setFormData={setFormData}
                    t={t}
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

interface IRemoveButtonProps {
  fieldId: string;
  setFormData: React.Dispatch<React.SetStateAction<IFormData>>;
  t: TFunction;
}

function RemoveButton({ fieldId, setFormData, t }: IRemoveButtonProps) {
  let handleRemoveField = (fieldUniqueId: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      customFieldDefinitions: prevFormData.customFieldDefinitions.filter(
        (field) => field.client_id != fieldUniqueId
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
        {t('field.button')}
      </button>
    </div>
  );
}

export {
  FormTitle,
  NameInput,
  DescriptionInput,
  ImageInput,
  CategorySelection,
  CreateField,
  Fields
};
