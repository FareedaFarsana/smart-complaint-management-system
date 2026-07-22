import "../../styles/FilterSelect.css"

function FilterSelect({
    value,
    onChange,
    options,
    placeholder
}) {
  return (
    <select
            className="filter-select"
            value={value}
            onChange={onChange}
        >
            <option value="">
                {placeholder}
            </option>

            {options.map((option) => (
                <option
                    key={option.value}
                    value={option.value}
                >
                    {option.label}
                </option>
            ))}
        </select>
  )
}

export default FilterSelect