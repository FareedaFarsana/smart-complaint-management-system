
import "./actionButtons.css"

function ActionButtons({
    onView,
    onEdit,
    onDelete,
    userRole
}) {
    return (
        <div className="action-buttons">

            {/* Everyone can view */}
            <button
                className="view-btn"
                onClick={onView}
                title="View Complaint"
            >
                👁
            </button>

            {/* ADMIN and STAFF can edit */}
            {(userRole === "ADMIN" || userRole === "STAFF") && (
                <button
                    className="edit-btn"
                    onClick={onEdit}
                    title="Edit Complaint"
                >
                    ✏
                </button>
            )}

            {/* Only ADMIN can delete */}
            {userRole === "ADMIN" && (
                <button
                    className="delete-btn"
                    onClick={onDelete}
                    title="Delete Complaint"
                >
                    🗑
                </button>
            )}

        </div>
    )
}

export default ActionButtons
