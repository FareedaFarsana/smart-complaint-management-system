
import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/feedback.css"

function Feedback() {

    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const response = await api.get("feedback/list/");
            setFeedbacks(response.data);
        } catch (error) {
            console.error("Failed to fetch feedback:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading feedback...</p>;
    }

    const averageRating = feedbacks.length
        ? (
            feedbacks.reduce((total, item) => total + item.rating, 0) /
            feedbacks.length
        ).toFixed(1)
        : "0.0";

        const averageExperience = feedbacks.length
            ? (
                feedbacks.reduce(
                    (total, item) => total + item.service_experience,
                    0
                ) / feedbacks.length
            ).toFixed(1)
            : "0.0";

    
return (
    <div className="feedback-page">

        <div className="feedback-page-header">
            <h2>Feedback & Rating</h2>
            <p>View feedback submitted by students.</p>
        </div>

        <div className="feedback-summary">

            <div className="feedback-summary-card">
                <h3>{feedbacks.length}</h3>
                <p>Total Feedback</p>
            </div>

            <div className="feedback-summary-card">
                <h3>⭐ {averageRating}/5</h3>
                <p>Average Rating</p>
            </div>

            <div className="feedback-summary-card">
                <h3>😊 {averageExperience}/5</h3>
                <p>Average Service Experience</p>
            </div>

        </div>

        {feedbacks.length === 0 ? (
            <p className="no-feedback">No feedback available.</p>
        ) : (
            <div className="feedback-list">

                {feedbacks.map((feedback) => (
                    <div className="feedback-card" key={feedback.id}>

                        <div className="feedback-card-header">
                            <div>
                                <h3>Complaint ID: {feedback.complaint}</h3>
                                <p className="feedback-student-name">
                                    Student: {feedback.student_name}
                                </p>
                            </div>

                            <span>
                                {new Date(feedback.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="feedback-rating">
                            <strong>Overall Rating</strong>
                            <span>
                                {"★".repeat(feedback.rating)}
                                {"☆".repeat(5 - feedback.rating)}
                                <small> ({feedback.rating}/5)</small>
                            </span>
                        </div>

                        <div className="feedback-experience">
                            <strong>Service Experience</strong>
                            <span>
                                {[
                                    "☹️ Very Poor",
                                    "🙁 Poor",
                                    "😐 Average",
                                    "🙂 Good",
                                    "😊 Excellent"
                                ][feedback.service_experience - 1]}
                            </span>
                        </div>

                        <div className="feedback-comments">
                            <strong>Comments</strong>
                            <p>{feedback.comments || "No comments provided."}</p>
                        </div>

                    </div>
                ))}

            </div>
        )}

    </div>
);

}

export default Feedback;
