import type { APIContext } from "astro";
import { EmailService } from "../services/emailService";

export const emailRetrieve = async ({ request }: APIContext) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
    const unread = url.searchParams.get('unread') === 'true';
    const cursor = url.searchParams.get('cursor') || undefined;

    console.log("Received email retrieve request:", { limit, unread, cursor });
    
    const result = await EmailService.retrieveEmails({ limit, unread, cursor });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error('Error retrieving emails:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to retrieve emails",
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
