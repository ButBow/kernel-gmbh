import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Performance: Report Web Vitals in development
if (import.meta.env.DEV) {
  import('./hooks/useWebVitals').then(({ useWebVitals }) => {
    // Web Vitals will be reported via the hook in App
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
