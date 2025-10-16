import { calendarService } from '../services/calendarService.js';

export const calendarController = {
  async retrieve(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const calendarId = url.searchParams.get('calendar_id') || 'primary';
      const limit = parseInt(url.searchParams.get('limit') || '5');
      const cursor = url.searchParams.get('cursor') || undefined;

      const result = await calendarService.retrieveEvents({
        calendarId,
        limit,
        cursor,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Calendar retrieve error:', error);
      
      return new Response(
        JSON.stringify({
          error: 'Failed to retrieve calendar events',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  },
};
