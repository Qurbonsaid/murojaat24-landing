import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { init } from "@tma.js/sdk-react";
import App from "./App";
import "@/index.css";

const queryClient = new QueryClient();

// Initialize Telegram SDK if available (safe to fail outside Telegram)
try {
  init();
} catch (error) {
  console.log(
    "TMA SDK initialization skipped (running outside Telegram)",
    error,
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster richColors />
    </QueryClientProvider>
  </React.StrictMode>,
);
