import "../../styles/dashboardCard.css";

function DashboardCard({
    title,
    value,
    icon,
    color,
}) {

    return (

      <div className="dashboard-card">

        <div className="card-header">

            <div
                className="card-icon"
                style={{
                    background: `${color}15`,
                    color: color
                }}
            >
                {icon}
            </div>

            <div className="card-info">

                <h3>{title}</h3>

                <p>
                    {title === "Total Complaints"
                        ? "All submitted complaints"
                        : `Total ${title}`}
                </p>

            </div>

        </div>

        <div className="card-value">

            {value}

        </div>

        <div
            className="card-footer"
            style={{
                background:`${color}12`
            }}
        >

            <svg
                viewBox="0 0 120 40"
                className="sparkline"
            >
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    points="0,30 15,30 30,22 45,28 60,15 75,22 90,10 105,18 120,8"
                />
            </svg>

        </div>

    </div> 

    );

}

export default DashboardCard;