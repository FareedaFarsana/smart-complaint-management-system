import "./actionButtons.css"

function ActionButtons({
    onView,

    onEdit,

    onDelete
}) {
  return (
    <div className="action-buttons">

            <button
                className="view-btn"
                onClick={onView}
            >
                👁
            </button>

            <button
                className="edit-btn"
                onClick={onEdit}
            >
                ✏
            </button>

            <button
                className="delete-btn"
                onClick={onDelete}
            >
                🗑
            </button>

        </div>
  )
}

export default ActionButtons