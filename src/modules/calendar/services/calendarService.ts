export interface CalendarEvent {
  busy: boolean;
  calendar_id: string;
  conferencing?: {
    provider: string;
    details: {
      meeting_code?: string;
      url?: string;
    };
  };
  hide_participants: boolean;
  ical_uid: string;
  organizer: {
    name: string;
    email: string;
  };
  participants: Array<{
    email: string;
    status: string;
    name?: string;
  }>;
  resources: any[];
  read_only: boolean;
  reminders: {
    use_default: boolean;
    overrides: any[];
  };
  title: string;
  visibility: string;
  creator: {
    name: string;
    email: string;
  };
  html_link: string;
  grant_id: string;
  id: string;
  object: string;
  status: string;
  when: {
    start_timezone: string;
    end_timezone: string;
    object: string;
    start_time: number;
    end_time: number;
  };
  created_at: number;
  updated_at: number;
}

export interface CalendarResponse {
  request_id: string;
  data: CalendarEvent[];
  next_cursor?: string;
}

export const calendarService = {
  async retrieveEvents(options: {
    calendarId?: string;
    limit?: number;
    cursor?: string;
  } = {}): Promise<CalendarResponse> {
    const { calendarId = 'primary', limit = 5, cursor } = options;
    
    const params = new URLSearchParams({
      calendar_id: calendarId,
      limit: limit.toString(),
    });
    
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    const grantId = 'd586cc16-b618-4faa-a7f9-6f8cfd00934d';
    const bearerToken = 'nyk_v0_rvORXb29XjIV8Vl3MceTgW30uBOCDjmFZ4NzNjh0H74IthvBMbx5W0fuzUKnzNfr';
    
    const url = `https://api.us.nylas.com/v3/grants/${grantId}/events?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  },

  formatEventTime(startTime: number, endTime: number, timezone: string): string {
    const start = new Date(startTime * 1000);
    const end = new Date(endTime * 1000);
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    };
    
    const startFormatted = start.toLocaleTimeString('en-US', timeOptions);
    const endFormatted = end.toLocaleTimeString('en-US', timeOptions);
    
    return `${startFormatted} - ${endFormatted}`;
  },

  formatEventDate(timestamp: number, timezone: string): string {
    const date = new Date(timestamp * 1000);
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: timezone,
    };
    
    return date.toLocaleDateString('en-US', dateOptions);
  },

  isToday(timestamp: number, timezone: string): boolean {
    const eventDate = new Date(timestamp * 1000);
    const today = new Date();
    
    // Convert both dates to the same timezone for comparison
    const eventDateStr = eventDate.toLocaleDateString('en-US', { timeZone: timezone });
    const todayStr = today.toLocaleDateString('en-US', { timeZone: timezone });
    
    return eventDateStr === todayStr;
  },

  isUpcoming(timestamp: number): boolean {
    const eventTime = timestamp * 1000;
    const now = Date.now();
    
    return eventTime > now;
  },

  getEventColor(index: number): string {
    const colors = [
      'blue',
      'green',
      'purple',
      'red',
      'yellow',
      'indigo',
      'pink',
      'teal'
    ];
    
    return colors[index % colors.length];
  }
};
