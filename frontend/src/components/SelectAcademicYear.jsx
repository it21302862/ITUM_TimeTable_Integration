import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import activeYearImage from '../assets/active-year.jpg';

const SelectAcademicYear = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const data = await api.getAcademicYears();
        setAcademicYears(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicYears();
  }, []);

  const getStatusImage = (status) => {
    if (status === 'ACTIVE') {
      return activeYearImage;
    }
    // For other statuses, use gradient backgrounds
    return null;
  };

  const getStatusImageStyle = (status) => {
    if (status === 'ACTIVE') {
      return null; // Will use actual image
    }
    switch (status) {
      case 'PAST':
        return { background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' };
      case 'DRAFT':
        return { background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' };
      default:
        return { background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' };
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'PAST':
        return 'bg-status-past text-white';
      case 'ACTIVE':
        return 'bg-primary-blue text-white';
      case 'DRAFT':
        return 'bg-status-draft text-text-dark';
      default:
        return 'bg-gray-medium text-white';
    }
  };

  const getCardDescription = (status) => {
    switch (status) {
      case 'PAST':
        return 'Archived Schedules';
      case 'ACTIVE':
        return 'Current Academic Period';
      case 'DRAFT':
        return 'Future Planning';
      default:
        return '';
    }
  };

  const getActionText = (status) => {
    switch (status) {
      case 'PAST':
        return 'View Records →';
      case 'ACTIVE':
        return 'Open Dashboard →';
      case 'DRAFT':
        return 'Start Planning →';
      default:
        return 'View →';
    }
  };

  const handleCardClick = (year) => {
    navigate(`/semesters/${year.id}`, { state: { yearLabel: year.yearLabel } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-medium">Loading academic years...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-16 h-8 bg-primary-blue rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">ITUM</span>
              </div>
              <span className="text-xl font-semibold text-text-dark">UniTime</span>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="#" className="text-gray-medium hover:text-primary-blue flex items-center space-x-1">
                <span>🏠</span>
                <span>Home</span>
              </a>
              <a href="#" className="text-gray-medium hover:text-primary-blue flex items-center space-x-1">
                <span>🕐</span>
                <span>History</span>
              </a>
              <a href="#" className="text-gray-medium hover:text-primary-blue flex items-center space-x-1">
                <span>💬</span>
                <span>Emergency Chat</span>
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-gray-medium">🔔</span>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-dark mb-4">Select Academic Year</h1>
          <p className="text-gray-medium text-lg max-w-2xl mx-auto">
            Welcome to the Timetable Portal. Choose the relevant academic period to view your schedules, course plans, and semester breakdowns.
          </p>
        </div>

        {/* Academic Year Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {academicYears.map((year) => {
            const isActive = year.status === 'ACTIVE';
            return (
              <div
                key={year.id}
                onClick={() => handleCardClick(year)}
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  isActive ? 'ring-2 ring-primary-blue' : 'border border-border-subtle'
                }`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden" style={getStatusImageStyle(year.status)}>
                  {getStatusImage(year.status) ? (
                    <img
                      src={getStatusImage(year.status)}
                      alt={`${year.yearLabel} Year`}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(year.status)}`}>
                    {year.status}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-dark mb-2">{year.yearLabel} Year</h3>
                  <p className="text-gray-medium mb-4">{getCardDescription(year.status)}</p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(year);
                    }}
                    className="text-primary-blue font-medium hover:underline inline-flex items-center"
                  >
                    {getActionText(year.status)}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assistance Section */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🎧</span>
            </div>
            <div>
              <h3 className="font-bold text-text-dark mb-1">Need Immediate Assistance?</h3>
              <p className="text-gray-medium">Our academic support team is online to resolve timetable conflicts.</p>
            </div>
          </div>
          <button className="bg-primary-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-blue-light transition-colors flex items-center space-x-2">
            <span>💬</span>
            <span>Open Emergency Chat</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border-subtle mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-medium text-sm">
              © 2024 UniTime Academic Systems. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <a href="#" className="text-primary-blue hover:underline">Privacy Policy</a>
              <span className="text-gray-medium">•</span>
              <a href="#" className="text-primary-blue hover:underline">User Guide</a>
              <span className="text-gray-medium">•</span>
              <a href="#" className="text-primary-blue hover:underline">Support Portal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SelectAcademicYear;
