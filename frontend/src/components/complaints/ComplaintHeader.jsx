import "../../styles/complaintHeader.css";

function ComplaintHeader({ totalComplaints }) {
  return (
    
    <div className="complaint-header">

            <div>

                <div className="breadcrumb">

                    Dashboard
                    <span>/</span>
                    Complaints

                </div>

                <h1>
                    Complaints Management
                </h1>

                <p>
                    Manage, monitor and resolve citizen complaints efficiently.
                </p>

            </div>

            <div className="complaint-count">

                <span>Showing</span>

                <h2>{totalComplaints}</h2>

                <small>Complaints</small>

            </div>

        </div>
  )
}

export default ComplaintHeader