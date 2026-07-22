import "../../styles/complaintsTable.css";

import { useNavigate } from "react-router-dom";

import { FiArrowRight } from "react-icons/fi";

// helper function
function formatDate(dateString) {

    const date = new Date(dateString);

    const today = new Date();

    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    }

    if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

}

function RecentComplaintsTable({ complaints }) { 

    const navigate = useNavigate();

  return (
    <div className="table-card">

            <div className="table-header">

                <div className="table-title">
                    <h2>Recent Complaints</h2>
                    <p>Latest complaints submitted by users</p>
                </div>

                <button className="view-all-btn" onClick={() => navigate("/complaints")}>
                    View All
                    <FiArrowRight/>
                </button>

            </div>

            <div className="table-responsive">
                <table>

                    <thead>

                        <tr>

                            <th>Title</th>

                            <th>Status</th>

                            <th>Priority</th>

                            <th>Date</th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            complaints.length === 0 ?

                            (
                                <tr>

                                    <td
                                        colSpan="4"
                                        className="no-data"
                                    >

                                        No complaints found.

                                    </td>

                                </tr>
                            ):

                            complaints.map((complaint)=>(

                                <tr key={complaint.id}>

                                    <td>{complaint.title}</td>

                                    <td>
                                        <span
                                            className={`status ${complaint.status.toLowerCase().replace(" ", "-")}`}
                                        >
                                            {complaint.status}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`priority ${complaint.priority.toLowerCase()}`}
                                        >
                                            {complaint.priority}
                                        </span>
                                    </td>

                                    <td>{formatDate(complaint.created_at)}</td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>
            </div>

        </div>
  )
}

export default RecentComplaintsTable