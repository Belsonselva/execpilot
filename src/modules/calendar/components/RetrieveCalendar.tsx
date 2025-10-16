import { useState, useEffect } from 'react';
import { calendarService, type CalendarEvent } from '../services/calendarService';

interface RetrieveCalendarProps {
  className?: string;
}

const RetrieveCalendar: React.FC<RetrieveCalendarProps> = ({ className = '' }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [calendarId, setCalendarId] = useState('primary');
  const [isChanging, setIsChanging] = useState(false);

  const fetchEvents = async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        calendar_id: calendarId,
        limit: '10'
      });
      
      if (isLoadMore && nextCursor) {
        params.append('cursor', nextCursor);
      }

      const response = await fetch(`/api/calendar/retrieve?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (isLoadMore) {
        setEvents(prev => [...prev, ...data.data]);
      } else {
        setEvents(data.data);
      }
      
      setNextCursor(data.next_cursor);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Show initial loading state immediately
    setLoading(true);
    
    // Use a timeout to allow navigation to update immediately
    // while the API call happens asynchronously
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [calendarId]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  const formatEventTime = (event: CalendarEvent): string => {
    return calendarService.formatEventTime(
      event.when.start_time,
      event.when.end_time,
      event.when.start_timezone
    );
  };

  const formatEventDate = (event: CalendarEvent): string => {
    return calendarService.formatEventDate(
      event.when.start_time,
      event.when.start_timezone
    );
  };

  const isEventToday = (event: CalendarEvent): boolean => {
    return calendarService.isToday(event.when.start_time, event.when.start_timezone);
  };

  const isEventUpcoming = (event: CalendarEvent): boolean => {
    return calendarService.isUpcoming(event.when.start_time);
  };

  const getEventColorClasses = (index: number) => {
    const color = calendarService.getEventColor(index);
    return {
      bg: `bg-${color}-50`,
      border: `border-${color}-200`,
      text: `text-${color}-800`,
      dot: `bg-${color}-500`,
      button: `bg-${color}-100 hover:bg-${color}-200 text-${color}-700`,
    };
  };

  const todayEvents = events.filter(isEventToday);
  const upcomingEvents = events.filter(event => !isEventToday(event) && isEventUpcoming(event));
  const pastEvents = events.filter(event => !isEventUpcoming(event));

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Calendar Events
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage your schedule and upcoming appointments
            </p>
          </div>
          
          {/* Calendar Filter */}
          <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
            <button
              onClick={() => {
                setIsChanging(true);
                setCalendarId('primary');
                setTimeout(() => setIsChanging(false), 300);
              }}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                calendarId === 'primary' 
                  ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              } ${isChanging ? 'opacity-75' : ''}`}
              disabled={isChanging}
            >
              Primary Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              Today's Events ({todayEvents.length})
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-3">
            {todayEvents.map((event, index) => {
              const colors = getEventColorClasses(index);
              return (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`group p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${colors.dot}`}></div>
                        <h3 className={`font-semibold truncate ${colors.text}`}>
                          {event.title || 'Untitled Event'}
                        </h3>
                        {event.conferencing?.provider && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            {event.conferencing.provider}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatEventTime(event)}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {event.organizer.email}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {event.participants.length} participants
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-2 h-16 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Upcoming Events ({upcomingEvents.length})
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-3">
            {upcomingEvents.map((event, index) => {
              const colors = getEventColorClasses(index + todayEvents.length);
              return (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`group p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${colors.dot}`}></div>
                        <h3 className={`font-semibold truncate ${colors.text}`}>
                          {event.title || 'Untitled Event'}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {formatEventDate(event)}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatEventTime(event)}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {event.organizer.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && events.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Your calendar is empty. Create some events to get started!</p>
        </div>
      )}

      {/* Load More Button */}
      {nextCursor && !loading && (
        <div className="text-center">
          <button
            onClick={() => fetchEvents(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Load More Events
          </button>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeEventModal}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedEvent.title || 'Untitled Event'}
                  </h2>
                  <div className="flex items-center space-x-4 text-blue-100">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatEventTime(selectedEvent)}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v14a2 2 0 002 2z" />
                      </svg>
                      {formatEventDate(selectedEvent)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeEventModal}
                  className="ml-4 text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Status: <span className="font-medium text-gray-900">{selectedEvent.status}</span></span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Visibility: <span className="font-medium text-gray-900">{selectedEvent.visibility}</span></span>
                    </div>
                    {selectedEvent.conferencing && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          Meeting: 
                          <a 
                            href={selectedEvent.conferencing.details.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-800 ml-1"
                          >
                            {selectedEvent.conferencing.provider}
                          </a>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Organizer</h3>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {selectedEvent.organizer.name ? selectedEvent.organizer.name[0].toUpperCase() : selectedEvent.organizer.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedEvent.organizer.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">{selectedEvent.organizer.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participants */}
              {selectedEvent.participants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Participants ({selectedEvent.participants.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedEvent.participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {participant.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{participant.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          participant.status === 'yes' ? 'bg-green-100 text-green-800' :
                          participant.status === 'no' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {participant.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {selectedEvent.conferencing?.details.url && (
                  <a
                    href={selectedEvent.conferencing.details.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-center"
                  >
                    Join Meeting
                  </a>
                )}
                <a
                  href={selectedEvent.html_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center"
                >
                  View in Calendar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetrieveCalendar;
