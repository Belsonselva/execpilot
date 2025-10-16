import React, { useState, useEffect } from 'react';
import type { EmailMessage, EmailResponse } from '../services/emailService';
import { EmailService } from '../services/emailService';

interface RetrieveMailProps {
  className?: string;
}

const RetriveMail: React.FC<RetrieveMailProps> = ({ className = '' }) => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  const [isFilterChanging, setIsFilterChanging] = useState(false);

  const fetchEmails = async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: '5',
        unread: filter === 'unread' ? 'true' : 'false'
      });
      
      if (isLoadMore && nextCursor) {
        params.append('cursor', nextCursor);
      }

      const response = await fetch(`/api/email/retrieve?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (isLoadMore) {
        setEmails(prev => [...prev, ...data.data]);
      } else {
        setEmails(data.data);
      }
      
      setNextCursor(data.next_cursor);
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
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
      fetchEmails();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [filter]);  const handleEmailClick = (email: EmailMessage) => {
    setSelectedEmail(email);
  };

  const closeEmailModal = () => {
    setSelectedEmail(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFolderBadgeColor = (folder: string) => {
    const colorMap: Record<string, string> = {
      'INBOX': 'bg-blue-100 text-blue-800',
      'UNREAD': 'bg-red-100 text-red-800',
      'SPAM': 'bg-yellow-100 text-yellow-800',
      'IMPORTANT': 'bg-green-100 text-green-800',
      'CATEGORY_PROMOTIONS': 'bg-purple-100 text-purple-800',
      'CATEGORY_UPDATES': 'bg-indigo-100 text-indigo-800',
    };
    return colorMap[folder] || 'bg-gray-100 text-gray-800';
  };

  const extractTextContent = (html: string): string => {
    return EmailService.extractTextFromHtml(html);
  };

  const truncateText = (text: string, maxLength: number = 100): string => {
    return EmailService.truncateText(text, maxLength);
  };

  return (
    <div className={`max-w-7xl mx-auto p-4 sm:p-6 ${className}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .email-content {
            line-height: 1.6;
          }
          .email-content img {
            max-width: 100%;
            height: auto;
            margin: 1rem 0;
          }
          .email-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
          }
          .email-content td, .email-content th {
            border: 1px solid #e5e7eb;
            padding: 0.5rem;
            text-align: left;
          }
          .email-content a {
            color: #3b82f6;
            text-decoration: underline;
          }
          .email-content a:hover {
            color: #1d4ed8;
          }
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `
      }} />
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Email Manager</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your emails efficiently</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Filter Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
            <button
              onClick={() => {
                setIsFilterChanging(true);
                setFilter('all');
                setTimeout(() => setIsFilterChanging(false), 300);
              }}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              } ${isFilterChanging ? 'opacity-75' : ''}`}
              disabled={isFilterChanging}
            >
              All Emails
            </button>
            <button
              onClick={() => {
                setIsFilterChanging(true);
                setFilter('unread');
                setTimeout(() => setIsFilterChanging(false), 300);
              }}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                filter === 'unread' 
                  ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              } ${isFilterChanging ? 'opacity-75' : ''}`}
              disabled={isFilterChanging}
            >
              Unread Only
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchEmails()}
            disabled={loading}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 w-full sm:w-auto"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                </svg>
                <span className="hidden sm:inline">Refreshing...</span>
                <span className="sm:hidden">Loading</span>
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Sync</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading emails</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Email List */}
      <div className="bg-white rounded-lg shadow">
        {loading && emails.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg className="animate-spin mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
              </svg>
              <p className="mt-2 text-gray-500">Loading emails...</p>
            </div>
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No emails found</h3>
            <p className="mt-2 text-gray-500">
              {filter === 'unread' ? 'No unread emails at the moment.' : 'No emails to display.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => handleEmailClick(email)}
                className={`p-4 sm:p-6 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-all duration-200 border-l-4 ${
                  email.unread 
                    ? 'bg-blue-50 border-l-blue-500 hover:bg-blue-100' 
                    : 'border-l-transparent hover:border-l-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset touch-manipulation`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleEmailClick(email);
                  }
                }}
                role="button"
                aria-label={`Open email: ${email.subject || '(No Subject)'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2 space-y-1 sm:space-y-0">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${
                            email.unread ? 'bg-blue-600' : 'bg-gray-300'
                          }`}></div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {EmailService.getEmailSender(email)}
                        </p>
                        {email.starred && (
                          <svg className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 sm:ml-auto flex-shrink-0">
                        {formatDate(email.date)}
                      </span>
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {email.subject || '(No Subject)'}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                      {truncateText(extractTextContent(email.snippet || email.body))}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {email.folders.slice(0, 3).map((folder, index) => (
                        <span
                          key={folder}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFolderBadgeColor(folder)} ${
                            index >= 2 ? 'hidden sm:inline-flex' : ''
                          }`}
                        >
                          {folder.replace('CATEGORY_', '').replace('_', ' ')}
                        </span>
                      ))}
                      {email.folders.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 sm:hidden">
                          +{email.folders.length - 2} more
                        </span>
                      )}
                      {email.folders.length > 3 && (
                        <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          +{email.folders.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-2 sm:ml-4 flex-shrink-0 flex items-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {nextCursor && !loading && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => fetchEmails(true)}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              Load More Emails
            </button>
          </div>
        )}
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black opacity-75 transition-opacity"
            onClick={closeEmailModal}
          ></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <div 
              className="relative bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedEmail.unread ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></div>
                    {selectedEmail.starred && (
                      <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {selectedEmail.folders.slice(0, 3).map((folder) => (
                        <span
                          key={folder}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFolderBadgeColor(folder)}`}
                        >
                          {folder.replace('CATEGORY_', '').replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {selectedEmail.subject || '(No Subject)'}
                  </h2>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 w-16">From:</span>
                      <span className="text-gray-900">{EmailService.getEmailSender(selectedEmail)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 w-16">To:</span>
                      <span className="text-gray-900">{EmailService.getEmailRecipient(selectedEmail)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 w-16">Date:</span>
                      <span className="text-gray-900">{EmailService.formatEmailDate(selectedEmail.date)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={closeEmailModal}
                  className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close email"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="prose prose-sm max-w-none">
                  {selectedEmail.body ? (
                    <div className="email-content">
                      {(() => {
                        const textContent = extractTextContent(selectedEmail.body);
                        if (textContent.length > 50) {
                          // If we have good text content, show it formatted
                          return (
                            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                              {textContent}
                            </div>
                          );
                        } else {
                          // If text extraction didn't work well, show HTML but cleaned up
                          const cleanHtml = selectedEmail.body
                            .replace(/<style[^>]*>.*?<\/style>/gis, '')
                            .replace(/<script[^>]*>.*?<\/script>/gis, '')
                            .replace(/style="[^"]*"/gi, '')
                            .replace(/class="[^"]*"/gi, '')
                            .replace(/<(div|span|p)[^>]*>/gi, '<div>')
                            .replace(/<\/(div|span|p)>/gi, '</div>')
                            .replace(/<br\s*\/?>/gi, '\n');
                          
                          return (
                            <div 
                              className="text-gray-800 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: cleanHtml }}
                            />
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <div className="text-gray-700 text-base leading-relaxed">
                      {selectedEmail.snippet}
                    </div>
                  )}
                </div>

                {/* Attachments */}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Attachments ({selectedEmail.attachments.length})
                    </h4>
                    <div className="grid gap-3">
                      {selectedEmail.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {attachment.filename || `Attachment ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : 'Unknown size'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 space-y-3 sm:space-y-0">
                <div className="text-sm text-gray-500">
                  Thread ID: {selectedEmail.thread_id}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={closeEmailModal}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    Close
                  </button>
                  <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetriveMail;