export default function FormField({
  type,
  name,
  label,
  value,
  onChange,
  errorMsg
}) {
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        name={name}
        className='form-control mb-2'
        ref={value}
        onChange={onChange}
      />
      <div className='form-text fs-5 mb-3 text-danger'>{errorMsg}</div>
    </>
  );
}
