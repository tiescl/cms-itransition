export default function getFieldType(fieldType, t) {
  switch (fieldType) {
    case 'text':
      return t('fieldtype.text');
    case 'number':
      return t('fieldtype.number');
    case 'multiline_string':
      return t('fieldtype.multiline_string');
    case 'date':
      return t('fieldtype.date');
    case 'checkbox':
      return t('fieldtype.checkbox');
  }
}
