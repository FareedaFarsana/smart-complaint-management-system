import { FiSearch } from "react-icons/fi";

import "../../styles/SearchBox.css"

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="search-box">
        <FiSearch className="search-icon" />

            <input
                type="text"
                placeholder={placeholder || "Search..."}
                value={value}
                onChange={onChange}
            />
    </div>
  )
}

export default SearchBox