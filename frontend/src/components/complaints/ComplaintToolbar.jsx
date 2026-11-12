import "../../styles/complaintToolbar.css"
import FilterSelect from "../common/FilterSelect"

function ComplaintToolbar({
    search,
    setSearch,

    category,
    setCategory,

    status,
    setStatus
}) {

    const categoryOptions = [
        { value: "Plumbing", label: "Plumbing" },
        { value: "Electrical", label: "Electrical" },
        { value: "Maintenance", label: "Maintenance" }
    ];

    const statusOptions = [
        { value: "Pending", label: "Pending" },
        { value: "In Progress", label: "In Progress" },
        { value: "Resolved", label: "Resolved" }
    ];

  return (
    <div className="complaint-toolbar">

            {/* Search Box */}
            <input
                type="text"
                placeholder="Search complaints..."
                value={search}

                onChange={(e) =>
                setSearch(e.target.value)
                }
            />

            {/* Category Filter */}
            <FilterSelect
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={categoryOptions}
                placeholder="All categories"
            />

            {/* Status Filter */}
            <FilterSelect
                value={status}
                onChange={(e)=>setStatus(e.target.value)}
                options={statusOptions}
                placeholder="All Status"
            />

        </div>
  )
}

export default ComplaintToolbar