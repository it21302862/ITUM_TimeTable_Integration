import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';

const SelectSemester = () => {
  const { yearId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const yearLabel = location.state?.yearLabel || '2024';

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const data = await api.getSemestersByYear(yearId);
        setSemesters(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (yearId) {
      fetchSemesters();
    }
  }, [yearId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'CURRENT':
        return 'bg-primary-blue-light';
      case 'PAST':
        return 'bg-status-past';
      case 'DRAFT':
        return 'bg-status-plan-draft';
      default:
        return 'bg-status-orange';
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'CURRENT':
        return {
          icon: '⦿',
          text: 'Current Semester',
          color: 'text-primary-blue',
          border: 'border-primary-blue',
        };
      case 'PAST':
        return {
          icon: '◷',
          text: 'Past',
          color: 'text-gray-medium-dark',
          border: '',
        };
      case 'DRAFT':
        return {
          icon: '🔒',
          text: 'Plan Draft',
          color: 'text-gray-medium-dark',
          border: '',
        };
      case 'DRAFT':
        return {
          icon: '🔒',
          text: 'Plan Draft',
          color: 'text-gray-medium-dark',
          border: '',
        };
      default:
        return {
          icon: '🔒',
          text: 'Plan Draft',
          color: 'text-gray-medium-dark',
          border: '',
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getDateRange = (semester) => {
    const start = formatDate(semester.startDate);
    const end = formatDate(semester.endDate);
    if (start && end) {
      return `${start} - ${end}`;
    }
    return 'Date TBD';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-medium">Loading semesters...</div>
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
    <div className="min-h-screen bg-bg-light-alt">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-16 h-8 bg-primary-blue rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">ITUM</span>
              </div>
              <span className="text-xl font-semibold text-text-dark">UniTime Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-medium-dark cursor-pointer">⚙️</span>
              <div className="relative">
                <span className="text-gray-medium-dark cursor-pointer">🔔</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary-blue rounded-full"></span>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-border-subtle-alt"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-2 text-sm">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="text-primary-blue hover:underline flex items-center space-x-1"
          >
            <span>🏠</span>
            <span>{yearLabel}</span>
          </a>
          <span className="text-gray-medium-dark">/</span>
          <span className="text-gray-medium-dark">Semesters</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-dark mb-3">Select Semester</h1>
          <p className="text-gray-medium-dark text-lg">
            Choose the academic period you wish to manage for the academic year {yearLabel}.
          </p>
        </div>

        {/* Semester Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {semesters.map((semester, index) => {
            const statusInfo = getStatusInfo(semester.status);
            const isActive = semester.status === 'CURRENT';
            return (
              <div
                key={semester.id}
                onClick={() => navigate(`/timetable/${semester.id}`, {
                  state: {
                    semesterName: semester.name || `Semester ${index + 1}`,
                    yearLabel: yearLabel
                  }
                })}
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  isActive ? `ring-2 ${statusInfo.border}` : ''
                }`}
              >
                {/* Colored Top Bar */}
                <div className={`h-4 ${getStatusColor(semester.status)}`}>
                  {isActive && (
                    <div className="flex justify-end pr-2 pt-1">
                      <span className="bg-primary-blue-badge text-primary-blue text-xs px-2 py-0.5 rounded-full font-semibold">
                        ACTIVE
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-dark mb-2">
                    {semester.name || `Semester ${index + 1}`}
                  </h3>
                  <p className="text-gray-medium-dark mb-4">{getDateRange(semester)}</p>
                  <div className={`flex items-center space-x-2 ${statusInfo.color}`}>
                    <span>{statusInfo.icon}</span>
                    <span className="text-sm">{statusInfo.text}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Academic Plan Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary-blue rounded flex items-center justify-center">
              <span className="text-white text-lg">📊</span>
            </div>
            <div>
              <h3 className="font-bold text-text-dark mb-1">Academic Plan Overview</h3>
              <p className="text-gray-medium-dark">
                Review how these semesters align with your long-term graduation requirements and degree path.
              </p>
            </div>
          </div>
          <button className="bg-primary-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-blue-light transition-colors">
            View Degree Path...
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border-subtle mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-gray-medium text-sm">
            © 2024 UniTime Manager • Faculty of Academic Planning
          </p>
        </div>
      </footer>

      {/* Floating Chat Icon */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          <button className="w-14 h-14 bg-primary-blue rounded-full flex items-center justify-center shadow-lg hover:bg-primary-blue-light transition-colors">
            <span className="text-white text-xl">💬</span>
          </button>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectSemester;
