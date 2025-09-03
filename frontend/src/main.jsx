import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from "react-redux";
import store from './store/store.js';
import { AuthProvider } from "../context/AuthContext"; // ✅ import
import { VendorAssignmentProvider } from "../context/VendorAssignmentContext";


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      ,
      <Provider store={store}>
        <VendorAssignmentProvider>
          <App />
        </VendorAssignmentProvider>
      </Provider>
    </AuthProvider>
  </React.StrictMode>
);
