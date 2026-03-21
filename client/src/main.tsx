/// <reference types="vite/client" /> 
// ^^^ This line fixes the 'import.meta.env' error!

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/theme.css";

import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { BrowserRouter } from "react-router-dom";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: "#4f39f6",
          colorTextOnPrimaryBackground: "#ffffff",
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);