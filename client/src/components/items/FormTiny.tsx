import { useEffect, useContext, useState, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import ThemeContext from '../../context/ThemeContext';
import CreatableSelect from 'react-select/creatable';
import { StylesConfig } from 'react-select';
import ItemFormData from '../../types/ItemFormData';
import { ItemField } from '../../types/Item';
import Tag from '../../types/Tag';

interface IItemsProps {
  formData: ItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<ItemFormData>>;
}

function Items({ formData, setFormData }: IItemsProps) {
  let { t } = useTranslation();

  return (
    <div className='mb-4'>
      <h1 className='fs-3 fw-semibold'>{t('item.details.heading')}</h1>
      {formData.fields.map((field) => {
        return (
          <div key={field._id} className='mb-2'>
            <Item field={field} setFormData={setFormData} />
          </div>
        );
      })}
    </div>
  );
}

interface IItemProps {
  field: ItemField;
  setFormData: React.Dispatch<React.SetStateAction<ItemFormData>>;
}

function Item({ field, setFormData }: IItemProps) {
  let { t } = useTranslation();

  let handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prevFormData) => {
      let updatedFields = prevFormData.fields.map((field) =>
        field._id == fieldId
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
            htmlFor={`fieldValue-${field._id}`}
            className='form-label'
          >
            {field.name}
          </label>
          <ValueInput
            type={field.type}
            value={field.value}
            id={`fieldValue-${field._id}`}
            onChange={(
              event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              let target = event.target;
              if (field.type == 'checkbox') {
                if (target instanceof HTMLInputElement) {
                  handleFieldChange(
                    field._id ?? '',
                    String(target.checked)
                  );
                }
              } else {
                handleFieldChange(field._id ?? '', target.value);
              }
            }}
            placeholder={t('item.field.placeholder')}
          />
        </div>
      </div>
    </div>
  );
}

interface IValueInputProps {
  id: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

function ValueInput({
  id,
  type,
  value,
  onChange,
  placeholder
}: IValueInputProps) {
  let inputProps: {
    id: string;
    type: string;
    onChange: (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    className: string;
    value?: string;
    placeholder?: string;
    checked?: boolean;
  } = {
    id: id,
    type: type,
    onChange: onChange,
    className: 'form-control mb-2'
  };

  if (type != 'checkbox') {
    inputProps.value = value;
  }
  if (type != 'date' && type != 'checkbox') {
    inputProps.placeholder = placeholder;
  }
  if (type == 'multiline_string') {
    return <textarea {...inputProps} rows={1} />;
  }
  if (type == 'checkbox') {
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

interface ITagSelectionProps {
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  tagOptions: { label: string; value: string }[];
  setTagOptions: React.Dispatch<
    React.SetStateAction<{ label: string; value: string }[]>
  >;
  tagError: string;
  setTagError: React.Dispatch<React.SetStateAction<string>>;
}

function TagSelection({
  tags,
  setTags,
  tagOptions,
  setTagOptions,
  tagError,
  setTagError
}: ITagSelectionProps) {
  let { t } = useTranslation();
  let { theme } = useContext(ThemeContext);
  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;

  var [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let controller = new AbortController();

    let fetchTags = async () => {
      try {
        setIsLoading(true);
        let response = await fetch(`${prodUrl}/api/collections/tags`, {
          signal: controller.signal
        });
        if (!response.ok) {
          let data = await response.json();
          throw new Error(data.error);
        }
        let data = await response.json();
        setTagOptions(
          data.map((tag: Tag) => ({ value: tag.value, label: tag.label }))
        );
      } catch (error) {
        if ((error as Error)?.name != 'AbortError') {
          setTagError((error as Error)?.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();

    return () => controller.abort();
  }, []);

  let createOption = (label: string) => {
    let baseLabel = label.replace(/\W/g, '');
    let finalLabel = baseLabel.slice(0, Math.min(baseLabel.length, 50));
    return {
      label: `#${finalLabel}`,
      value: finalLabel,
      items: []
    };
  };

  let handleCreateOption = (inputValue: string) => {
    let newOption = createOption(inputValue);
    setTags((prev) => [...prev, newOption]);
  };

  let colourStyles: StylesConfig = {
    control: (styles) => ({
      ...styles,
      backgroundColor: theme,
      borderColor: theme == 'light' ? 'lightgrey' : 'grey'
    }),
    input: (styles) => ({
      ...styles,
      color: theme == 'light' ? 'black' : 'white'
    }),
    option: (styles, { isSelected }) => {
      return {
        ...styles,
        'backgroundColor': isSelected
          ? theme == 'dark'
            ? '#495057'
            : '#007bff'
          : theme == 'dark'
            ? '#343a40'
            : 'white',
        'color': isSelected
          ? 'white'
          : theme == 'dark'
            ? 'white'
            : 'black',
        ':hover': {
          backgroundColor: isSelected
            ? theme == 'dark'
              ? '#495057'
              : '#007bff'
            : theme == 'dark'
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
          setTags(newValue as Tag[]);
        }}
        onKeyDown={(event) => {
          if (event.key == 'Enter') {
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

interface IFormTitleProps {
  editMode: boolean;
}

function FormTitle({ editMode }: IFormTitleProps) {
  let { t } = useTranslation();

  return (
    <h1
      style={{ fontSize: '35px', margin: '125px auto 20px auto' }}
      className='text-center fw-semibold'
    >
      {editMode == true ? t('item.edit') : t('item.create')}{' '}
      {t('item.heading')}
    </h1>
  );
}

function NameInput({ formData, setFormData }: IItemsProps) {
  let { t } = useTranslation();

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

export { NameInput, FormTitle, TagSelection, ValueInput, Item, Items };
