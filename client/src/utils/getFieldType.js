export default function getFieldType(fieldType) {
  switch (fieldType) {
    case 'text':
      return 'Short Text';
    case 'number':
      return 'Number';
    case 'multiline_field':
      return 'Multiline Field';
    case 'date':
      return 'Date';
    case 'checkbox':
      return 'Checkbox (Yes/No)';
  }
}
