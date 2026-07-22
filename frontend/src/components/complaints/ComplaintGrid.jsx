import "../../styles/complaintGrid.css"

import Badge from "../common/Badge"
import ActionButtons from "../common/ActionButtons"

function ComplaintGrid({ complaints =[] }) {
  return (
    <div className="complaint-grid">

            <table>

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Title</th>

                        <th>Category</th>

                        <th>Priority</th>

                        <th>Status</th>

                        <th>Date</th>

                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {complaints.length > 0 ? (

                        complaints.map((complaint) => (

                            <tr key={complaint.id}>

                              <td>{complaint.id}</td>

                              <td>{complaint.title}</td>

                              <td>{complaint.category}</td>

                              <td>

                                  <Badge

                                      text={complaint.priority}

                                      type={complaint.priority.toLowerCase()}

                                  />

                              </td>

                              <td>

                                  <Badge

                                      text={complaint.status}

                                      type={
                                          complaint.status
                                              .toLowerCase()
                                              .replace(" ", "-")
                                      }

                                  />

                              </td>

                              <td>{complaint.created_at}</td>

                              <td>

                                  <ActionButtons

                                      onView={() => console.log("View", complaint.id)}

                                      onEdit={() => console.log("Edit", complaint.id)}

                                      onDelete={() => console.log("Delete", complaint.id)}

                                  />

                              </td>

                            </tr>

                        ))

                    ) : (

                        <tr>

                            <td
                                colSpan="7"
                                className="empty-state"
                            >
                                No complaints found.
                            </td>

                        </tr>

                    )}

                </tbody>

            </table>

        </div>
  )
}

export default ComplaintGrid