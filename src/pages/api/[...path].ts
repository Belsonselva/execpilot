import type { APIContext } from "astro";
import { emailRetrieve } from "../../modules/email/controllers/emailController";
import { calendarController } from "../../modules/calendar/controllers/calendarController";

type API = {
  [key: string]: (apiContext: APIContext) => Promise<Response>;
};



export const POST = async (apiContext: APIContext): Promise<Response> => {
  const apiRoutes: API = {
  };  

  return handleMethod(apiRoutes, apiContext.params.path || "", apiContext);
};

// export const PUT = async (apiContext: APIContext): Promise<Response> => {
//   const apiRoutes: API = {
//   };

//   return handleMethod(apiRoutes, apiContext.params.path || "", apiContext);
// };

export const GET = async (apiContext: APIContext): Promise<Response> => {
  const apiRoutes: API = {
    "email/retrieve": emailRetrieve,
    "calendar/retrieve": (context: APIContext) => calendarController.retrieve(context.request),
  };
  return handleMethod(apiRoutes, apiContext.params.path || "", apiContext);
};
export const OPTIONS = async (apiContext: APIContext): Promise<Response> => {
  const path = apiContext.params.path || "";
  
  // Handle CORS preflight for Twilio webhooks
  if (path === "twilio/sms-webhook") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Twilio-Signature",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  
  // Default response for other OPTIONS requests
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
};
const handleMethod = async (
  apiRoutes: API,
  path: string,
  apiContext: APIContext
): Promise<Response> => {
  const handler = apiRoutes[path];
  if (!handler) {
    console.log("No handler found for path:", path);
  }
  return handler ? handler(apiContext) : notFound();
};

const notFound = async (): Promise<Response> =>
  new Response("NotFound", { status: 404 });
