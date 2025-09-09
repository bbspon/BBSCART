import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL+"/api";
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  withCredentials: false, // set to true only if you’re using cookies
});

// Flag to track refresh attempts
let isRefreshing = false;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If unauthorized (401) and not a refresh attempt
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Prevent infinite loop

            // Prevent multiple refresh attempts at the same time
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    await api.post("/auth/refresh-token");
                    isRefreshing = false;

                    // Retry the original request
                    return api(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;
                    console.error("Token refresh failed:", refreshError);

                    // Clear any stored auth state (e.g., cookies, local storage, Redux state)
                    localStorage.removeItem("user"); // Example for local storage
                    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Clear cookies

                    // ✅ Allow access to public pages
                    const allowedPaths = ["/admin", "/seller", "/my-account"];
                    if (allowedPaths.includes(window.location.pathname)) {
                        window.location.href = "/login"; // Redirect only if it's a protected page
                    }

                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;



// // import axios from "axios";

// // const API = axios.create({
// //   // backend base — note: server.js is on port 5000 and vendor routes mounted at /vendors

// //   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",

// //   timeout: 30000,
// // });

// // export default API;

// frontend/src/services/api.js
// import axios from "axios";

// // Resolve API base URL for both dev and production.
// // - In production we use the nginx proxy: /api
// // - In dev use VITE_API_BASE_URL=http://localhost:5000
// function resolveBaseURL() {
//   let url = import.meta.env.VITE_API_BASE_URL || "/api";

//   // Safety: if running on a real domain, never use a localhost base
//   if (typeof window !== "undefined") {
//     const prodHost =
//       window.location.hostname !== "localhost" &&
//       window.location.hostname !== "127.0.0.1";
//     const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
//     if (prodHost && isLocal) url = "/api";
//   }

//   if (url.endsWith("/")) url = url.slice(0, -1);
//   return url;
// }

// const api = axios.create({
//   baseURL: resolveBaseURL(),
//   timeout: 45000,
//   withCredentials: false, // set true only if you use cookies for auth
//   headers: {
//     "Content-Type": "application/json",
//     "X-Requested-With": "XMLHttpRequest",
//   },
// });

// // ---- Refresh-token + HTML guard ----
// let isRefreshing = false;

// api.interceptors.response.use(
//   (response) => {
//     // Fast-fail if the API accidentally returns your SPA HTML
//     const ct = response.headers?.["content-type"] || "";
//     if (typeof response.data === "string" && ct.includes("text/html")) {
//       console.error(
//         "[api] HTML came from API. Check nginx /api proxy and baseURL. Sample:",
//         response.data.slice(0, 200)
//       );
//       throw new Error("API returned HTML instead of JSON");
//     }
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     // Handle expired access token
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       if (!isRefreshing) {
//         isRefreshing = true;
//         try {
//           await api.post("/auth/refresh-token");
//           isRefreshing = false;
//           return api(originalRequest);
//         } catch (refreshError) {
//           isRefreshing = false;
//           console.error("Token refresh failed:", refreshError);

//           try { localStorage.removeItem("user"); } catch (_) {}
//           try {
//             document.cookie =
//               "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//           } catch (_) {}

//           const protectedRoots = ["/admin", "/seller", "/my-account"];
//           if (
//             typeof window !== "undefined" &&
//             protectedRoots.includes(window.location.pathname)
//           ) {
//             window.location.href = "/login";
//           }
//           return Promise.reject(refreshError);
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;
