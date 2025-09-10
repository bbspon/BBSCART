// import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL+"/api";
// // const api = axios.create({
// //     baseURL: "http://localhost:4000/api",
// //     timeout: 45000,
// //     withCredentials: false,   // set to true only if you’re using cookies
// // });
// const api = axios.create({
//   baseURL: API_URL,
//   timeout: 45000,
//   withCredentials: false, // set to true only if you’re using cookies
// });

// // Flag to track refresh attempts
// let isRefreshing = false;

// api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;

//         // If unauthorized (401) and not a refresh attempt
//         if (error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true; // Prevent infinite loop

//             // Prevent multiple refresh attempts at the same time
//             if (!isRefreshing) {
//                 isRefreshing = true;

//                 try {
//                     await api.post("/auth/refresh-token");
//                     isRefreshing = false;

//                     // Retry the original request
//                     return api(originalRequest);
//                 } catch (refreshError) {
//                     isRefreshing = false;
//                     console.error("Token refresh failed:", refreshError);

//                     // Clear any stored auth state (e.g., cookies, local storage, Redux state)
//                     localStorage.removeItem("user"); // Example for local storage
//                     document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Clear cookies

//                     // ✅ Allow access to public pages
//                     const allowedPaths = ["/admin", "/seller", "/my-account"];
//                     if (allowedPaths.includes(window.location.pathname)) {
//                         window.location.href = "/login"; // Redirect only if it's a protected page
//                     }

//                     return Promise.reject(refreshError);
//                 }
//             }
//         }

//         return Promise.reject(error);
//     }
// );

// export default api;



// // import axios from "axios";

// // const API = axios.create({
// //   // backend base — note: server.js is on port 5000 and vendor routes mounted at /vendors

// //   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",

// //   timeout: 30000,
// // });

// // export default API;


import axios from "axios";

function resolveBaseURL() {
  let url = import.meta.env.VITE_API_BASE_URL || "/api";
  if (typeof window !== "undefined") {
    const prod =
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1";
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
    if (prod && isLocal) url = "/api";
  }
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

const api = axios.create({
  baseURL: resolveBaseURL(), // -> "/api" in prod
  withCredentials: true, // if you use cookies for auth
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.response.use(
  (res) => {
    const ct = res.headers?.["content-type"] || "";
    if (typeof res.data === "string" && ct.includes("text/html")) {
      console.error(
        "[api] HTML from API. Check Nginx/Express routing. Sample:",
        res.data.slice(0, 160)
      );
      throw new Error("API returned HTML instead of JSON");
    }
    return res;
  },
  (err) => Promise.reject(err)
);

export default api;
