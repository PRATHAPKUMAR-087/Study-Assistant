import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/HistoryPage.css"; // Import your scoped styles

export default function History() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            const userId = sessionStorage.getItem("userUUID");
            if (!userId) {
                console.error("No user ID found");
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/history?userId=${userId}`);
                const data = await response.json();
                setPlans(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching history:", error);
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="history-wrapper">
  <h1 className="mb-4 text-center">Study Plan History</h1>
  {loading ? (
    <p>Loading...</p>
  ) : plans.length === 0 ? (
    <p>No plans found.</p>
  ) : (
    <div className="table-responsive">
      <table className="table table-bordered table-striped history-table text-center">
        <thead>
          <tr>
            <th>Topic</th>
            <th>Created At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, idx) => (
            <tr key={idx}>
              <td>{plan.topic}</td>
              <td>{new Date(plan.created_at).toLocaleString()}</td>
              <td>
                <span className={`status-${plan.status.toLowerCase()}`}>
                  {plan.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
  <div className="text-center">
    <button className="btn btn-secondary mt-3" onClick={() => navigate("/dashboard")}>
      Back to Dashboard
    </button>
  </div>
</div>

    );
}
