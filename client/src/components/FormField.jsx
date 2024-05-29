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
      <br />
      <label htmlFor={name}>{label} </label>
      <input
        type={type}
        name={name}
        className='form-control'
        ref={value}
        onChange={onChange}
      />
      <div className='form-text text-danger'>{errorMsg}</div>
    </>
  );
}
