import { useState, useContext, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserContext from '../context/UserContext';

import {
  FormTitle,
  NameInput,
  DescriptionInput,
  ImageInput,
  CategorySelection,
  Fields,
  CreateField
} from '../components/collections/FormTiny';

import Collection from '../types/Collection';
import FormData from '../types/FormData';

interface ICollectionFormProps {
  collectionData?: Collection | null;
  editMode?: boolean;
}

export default function CollectionForm({
  collectionData = null,
  editMode = false
}: ICollectionFormProps) {
  let { t } = useTranslation();
  let navigate = useNavigate();
  let { collectionId } = useParams();

  var { user } = useContext(UserContext);
  var [formData, setFormData] = useState<FormData>({
    name: collectionData?.name ?? '',
    description: collectionData?.description ?? '',
    category: collectionData?.category ?? '',
    imageUrl: collectionData?.imageUrl ?? '',
    customFieldDefinitions: collectionData?.customFieldDefinitions ?? []
  });

  var [error, setError] = useState('');
  var [requestError, setRequestError] = useState('');
  var [imageError, setImageError] = useState('');

  let handleDisabled = (formSubmitData: FormData) => {
    setError('');
    if (error || imageError) {
      return true;
    }

    if (
      !formSubmitData.name ||
      !formSubmitData.category ||
      formSubmitData.customFieldDefinitions.length == 0
    ) {
      setError('collection.requiredFields');
      return true;
    } else {
      setError('');
    }

    for (const field of formSubmitData.customFieldDefinitions) {
      if (!field.client_id || !field.name || !field.type) {
        setError('collection.emptyCustomFields');
        return true;
      } else {
        setError('');
      }
    }

    return false;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
    const token = localStorage.getItem('auth');

    if (!handleDisabled(formData)) {
      e.currentTarget.disabled = true;
      setRequestError('');

      try {
        if (!user) {
          throw new Error('operation_forbidden');
        }

        const endpoint = collectionId
          ? `${prodUrl}/api/collections/${collectionId}`
          : `${prodUrl}/api/collections/create`;

        let response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            name: formData.name.trim(),
            customFieldDefinitions: formData.customFieldDefinitions.map(
              (customField) => {
                return {
                  ...customField,
                  name: customField.name.trim()
                };
              }
            ),
            user: user._id
          })
        });

        if (response.ok) {
          // const newCollection = await response.json();
          // console.log(newCollection);
          navigate('/collections');
        } else {
          let errorData = await response.json();
          e.currentTarget.disabled = false;
          throw new Error(errorData.error);
        }
      } catch (err) {
        e.currentTarget.disabled = false;
        setRequestError((err as Error)?.message);
      }
    }
  };

  return (
    <>
      <div className='container'>
        <FormTitle editMode={editMode} />

        <form onSubmit={handleSubmit} style={{ fontSize: '20px' }}>
          <div className='row'>
            <div className='col-md-8 mx-auto'>
              <NameInput formData={formData} setFormData={setFormData} />

              <DescriptionInput
                formData={formData}
                setFormData={setFormData}
              />

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

              <Fields formData={formData} setFormData={setFormData} />

              <CreateField setFormData={setFormData} />

              {error && (
                <h5 className='text-danger mt-2'>
                  {t(error, { defaultValue: t('error.default') })}
                </h5>
              )}
              {error == '' && requestError && (
                <h5 className='text-danger mt-2'>
                  {t(requestError, { defaultValue: t('error.default') })}
                </h5>
              )}

              <div className='my-5'>
                <button
                  type='submit'
                  className='btn btn-primary form-control'
                >
                  {editMode == true
                    ? t('collection.saveChanges')
                    : t('collection.create')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
