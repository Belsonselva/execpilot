interface EmailMessage {
  id: string;
  object: string;
  starred: boolean;
  unread: boolean;
  folders: string[];
  subject: string;
  thread_id: string;
  body: string;
  snippet: string;
  bcc: Array<{ name?: string; email: string }>;
  cc: Array<{ name?: string; email: string }>;
  attachments: any[];
  from: Array<{ name?: string; email: string }>;
  reply_to: Array<{ name?: string; email: string }>;
  to: Array<{ name?: string; email: string }>;
  date: number;
  grant_id: string;
}

interface EmailResponse {
  request_id: string;
  data: EmailMessage[];
  next_cursor?: string;
}

export class EmailService {
  private static readonly NYLAS_BASE_URL = 'https://api.us.nylas.com/v3';
  private static readonly GRANT_ID = 'd586cc16-b618-4faa-a7f9-6f8cfd00934d';
  private static readonly ACCESS_TOKEN = 'nyk_v0_rvORXb29XjIV8Vl3MceTgW30uBOCDjmFZ4NzNjh0H74IthvBMbx5W0fuzUKnzNfr';

  static async retrieveEmails(params?: {
    limit?: number;
    unread?: boolean;
    cursor?: string;
  }): Promise<EmailResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      if (params?.unread !== undefined) {
        queryParams.append('unread', params.unread.toString());
      }
      
      if (params?.cursor) {
        queryParams.append('page_token', params.cursor);
      }

      const url = `${this.NYLAS_BASE_URL}/grants/${this.GRANT_ID}/messages${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to retrieve emails: ${response.status} ${response.statusText}`);
      }

      const data: EmailResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error retrieving emails:', error);
      throw error;
    }
  }

  static formatEmailDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  static extractTextFromHtml(html: string): string {
    if (!html) return '';
    
    // Remove script and style elements completely
    let text = html.replace(/<script[^>]*>.*?<\/script>/gis, '');
    text = text.replace(/<style[^>]*>.*?<\/style>/gis, '');
    
    // Replace common HTML elements with appropriate spacing
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/?(div|p|h[1-6]|li|td|th)[^>]*>/gi, '\n');
    text = text.replace(/<\/?(span|a|strong|b|em|i|u)[^>]*>/gi, '');
    
    // Remove all remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#([0-9]+);/g, (match, num) => String.fromCharCode(parseInt(num)));
    text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
    
    // Clean up whitespace
    text = text.replace(/\n\s*\n/g, '\n\n'); // Multiple newlines to double newline
    text = text.replace(/[ \t]+/g, ' '); // Multiple spaces to single space
    text = text.trim();
    
    return text;
  }

  static truncateText(text: string, maxLength: number = 150): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  static getEmailSender(message: EmailMessage): string {
    if (message.from && message.from.length > 0) {
      const sender = message.from[0];
      return sender.name || sender.email;
    }
    return 'Unknown Sender';
  }

  static getEmailRecipient(message: EmailMessage): string {
    if (message.to && message.to.length > 0) {
      const recipient = message.to[0];
      return recipient.name || recipient.email;
    }
    return 'Unknown Recipient';
  }
}

export type { EmailMessage, EmailResponse };
