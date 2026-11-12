import "../../styles/Button.css"

function Button({
  children,

  onClick,

  type = "button",

  variant = "primary",

  disabled = false,

  loading = false

}) {
  return (
    <button

            type={type}

            className={`btn btn-${variant}`}

            onClick={onClick}

            disabled={disabled || loading}

        >

            {loading && <span className="spinner"></span>}

            {loading ? "Submitting..." : children}

    </button>

  )
}

export default Button