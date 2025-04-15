import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './feedback.css';

const feedbackSections = [
  {
    id: 'course_content_section',
    title: 'Course Content',
    questions: [
      { id: 'course_content', text: 'Relevance of course content to your program' },
      { id: 'course_materials', text: 'Quality and accessibility of course materials' },
      { id: 'course_organization', text: 'Organization and structure of the course' }
    ]
  },
  {
    id: 'faculty_evaluation_section',
    title: 'Faculty Evaluation',
    questions: [
      { id: 'teaching_quality', text: 'Clarity of instruction and explanations' },
      { id: 'faculty_knowledge', text: "Faculty's knowledge of the subject matter" },
      { id: 'faculty_availability', text: "Faculty's availability and responsiveness" }
    ]
  },
  {
    id: 'assessment_section',
    title: 'Assessment',
    questions: [
      { id: 'assessment_fairness', text: 'Fairness of assessments and grading' },
      { id: 'feedback_quality', text: 'Quality and timeliness of feedback on assignments' }
    ]
  }
];

const FeedbackAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get all info from navigation state (passed from select page)
  const {
    courseName,
    courseCode,
    facultyId,
    semester,
    department,
  } = location.state || {};

  const [feedbackData, setFeedbackData] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [activeSection, setActiveSection] = useState(feedbackSections[0].id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseCode) {
      setError('Missing course information.');
      setLoading(false);
      return;
    }
    fetchFeedbackData();
    // eslint-disable-next-line
  }, [courseCode]);

  const fetchFeedbackData = async () => {
    try {
      const response = await fetch(`/feedback/${courseCode}/${facultyId}`);
      if (!response.ok) throw new Error('Failed to fetch feedback data');
      const data = await response.json();
      setFeedbackData(data.feedback || []);
      setStatistics(data.statistics || {});
      setLoading(false);
    } catch (err) {
      setError('Failed to load feedback data');
      setLoading(false);
    }
  };

  const handleSectionChange = (sectionId) => setActiveSection(sectionId);

  const renderFeedbackForSection = () => {
    const currentSection = feedbackSections.find(s => s.id === activeSection);
    if (!currentSection) return null;

    return (
      <div className="feedback-responses">
        <div className="section-statistics">
          <h4>Question Statistics</h4>
          <div className="question-stats-grid">
            {currentSection.questions.map(question => (
              <div key={question.id} className="question-stat-item">
                <div className="question-stat-text">{question.text}</div>
                <div className="question-stat-value">
                  Average Rating: {statistics.questionStats?.[question.id]?.averageRating || 'N/A'}
                  <span className="response-count">
                    ({statistics.questionStats?.[question.id]?.responseCount || 0} responses)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {feedbackData.length > 0 && feedbackData.map(submission => {
          // Find ratings for questions in this section
          const sectionRatings = (submission.ratings || []).filter(r =>
            currentSection.questions.some(q => q.id === r.questionId)
          );
          if (sectionRatings.length === 0) return null;
          return (
            <div key={submission._id} className="feedback-submission">
              <div className="submission-header">
                <span className="submitted-by">
                  {submission.isAnonymous ? 'Anonymous' : (submission.student?.name || 'Student')}
                </span>
                <span className="submitted-on">
                  {new Date(submission.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="submission-content">
                {sectionRatings.map(rating => (
                  <div key={rating.questionId} className="question-response">
                    <div className="question-text">
                      {currentSection.questions.find(q => q.id === rating.questionId)?.text}
                    </div>
                    <div className="rating-display">Rating: {rating.rating}/5</div>
                  </div>
                ))}
                {submission.comments && (
                  <div className="submission-comments">
                    <strong>Comments:</strong> {submission.comments}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <div className="loading">Loading feedback data...</div>;

  return (
    <div className="feedback-view-container">
      <button onClick={() => navigate('/acadAdmin/feedback')} className="back-button">
        Back to Courses
      </button>
      <h2>
        {courseName ? `${courseName} (${courseCode})` : 'Course Feedback'}
      </h2>
      <div className="course-meta">
        {facultyId && <span><b>facultyId:</b> {facultyId}</span>}
        {semester && <span><b>Semester:</b> {semester}</span>}
        {department && <span><b>Department:</b> {department}</span>}
      </div>
      {error && <div className="error-message">{error}</div>}
      {!feedbackData.length ? (
        <div className="no-feedback-message">No feedback has been submitted for this course yet.</div>
      ) : (
        <>
          <div className="feedback-statistics">
            <div className="stat-card">
              <div className="stat-value">{statistics.totalResponses}</div>
              <div className="stat-label">Total Responses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{statistics.responseRate}%</div>
              <div className="stat-label">Response Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{statistics.averageRating}</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{statistics.anonymousCount}</div>
              <div className="stat-label">Anonymous Submissions</div>
            </div>
          </div>
          <h3>Feedback Sections</h3>
          <ul className="section-tabs">
            {feedbackSections.map(section => (
              <li
                key={section.id}
                className={activeSection === section.id ? 'active' : ''}
                onClick={() => handleSectionChange(section.id)}
              >
                {section.title}
              </li>
            ))}
          </ul>
          <div className="feedback-display">{renderFeedbackForSection()}</div>
        </>
      )}
    </div>
  );
};

export default FeedbackAdmin;
