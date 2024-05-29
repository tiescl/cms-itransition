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
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        name={name}
        className='block appearance-none w-full py-2 px-2 mb-1 text-base leading-normal bg-white text-gray-800 border border-gray-200 rounded'
        ref={value}
        onChange={onChange}
      />
      <div className='block text-lg mt-1 text-red-600'>{errorMsg}</div>
    </>
  );
}
