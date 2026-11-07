import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { initTelemetry } from "./lib/telemetry";

initTelemetry();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
