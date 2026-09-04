import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import App from "./App";
import { ToastProvider } from "./components/ui/ToastProvider";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { AuctionFlowProvider } from "./context/AuctionFlowContext";
import "sweetalert2/dist/sweetalert2.min.css";
import "./styles/gopal.css";
import "./styles/commerce.css";
import "./styles/experience.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

axios.defaults.baseURL = API_BASE_URL;
axios.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AuctionFlowProvider>
          <App />
        </AuctionFlowProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
