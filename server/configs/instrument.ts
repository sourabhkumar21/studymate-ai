 
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://c66cede171000f489442ef2d89545ff2@o4510775362977792.ingest.us.sentry.io/4510775384539136",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});