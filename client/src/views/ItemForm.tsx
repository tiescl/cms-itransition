import { useState, useContext, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import UserContext from '../context/UserContext';
import {
  NameInput,
  Items,
  TagSelection,
  FormTitle
} from '../components/items/FormTiny';

import Item from '../types/Item';
import Tag from '../types/Tag';
import Collection from '../types/Collection';

import '../styles/bootstrp.css';

interface IItemFormProps {
  collectionData: Collection;
  itemData?: Item;
  editMode?: boolean;
}

export default function ItemForm({
  collectionData,
  itemData,
  editMode = false
}: IItemFormProps) {
  let { t } = useTranslation();
  var { user } = useContext(UserContext);

  var [formData, setFormData] = useState(() => {
    let initialFields = collectionData.customFieldDefinitions.map(
      (fieldDef) => ({
        _id: fieldDef._id,
        name: fieldDef.name,
        value:
          itemData?.fields.find((f) => f._id == fieldDef._id)?.value || '',
        type: fieldDef.type
      })
    );

    return {
      name: itemData?.name || '',
      fields: initialFields
    };
  });

  let navigate = useNavigate();
  var [tags, setTags] = useState((itemData?.tags as Tag[]) || []);
  var [tagOptions, setTagOptions] = useState<
    { label: string; value: string }[]
  >([]);

  var [error, setError] = useState('');
  var [tagError, setTagError] = useState('');
  var [isLoading, setIsLoading] = useState(false);

  let handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
    const token = localStorage.getItem('auth');

    if (!tagError) {
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

        let response = await fetch(endpoint, {
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
                  field.type != 'checkbox'
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
          let errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        // console.log(err.message);
        setError((err as Error)?.message);
      } finally {
        setIsLoading(false);
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
                  type='submit'
                  disabled={isLoading}
                  className='btn btn-primary form-control'
                >
                  {editMode == true ? t('item.saveEdit') : t('item.save')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
