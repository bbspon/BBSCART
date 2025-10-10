import toast from "react-hot-toast";
import { logoutUser, setUser } from "../slice/authSlice";
import instance from "../services/axiosInstance";

// Register function
export const register = async (userData, dispatch, navigate) => {
  try {
    const response = await instance.post(
      `${import.meta.env.VITE_API_URL}/auth/register`,
      userData
    );
    if (
      response.status >= 200 &&
      response.status < 300 &&
      response.data?.user
    ) {
      const user = response.data.user;

      dispatch(setUser(user)); // ✅ Store user in Redux

      toast.success("Registration successful");

      // ✅ Updated navigation logic
      if (user.role === "admin" || user.role === "seller") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

      return user;
    }
    return response.data;
  } catch (error) {
    console.error("Registration Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.msg || "Registration failed");
  }
};

// Login function
export const login = async (dispatch, email, password, navigate) => {
  try {
    const response = await instance.post(
      `/auth/login`,
      { email, password },
      { withCredentials: true }
    );

    if (response.status === 200 && response.data?.user) {
      const user = response.data.user;

      dispatch(setUser(user)); // ✅ Store user in Redux

      toast.success("Login successful");

      // ✅ Updated navigation logic
      if (user.role === "admin" || user.role === "seller") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

      return user;
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Login failed");
  }
};

// Logout function
export const logout = async (dispatch) => {
  try {
    await instance.post("/auth/logout");
  } catch (error) {
    console.error(
      "Logout failed:",
      error.response?.data?.message || error.message
    );
  }

  // Ensure local storage and state are cleared
  localStorage.clear();
  dispatch(logoutUser());
  // window.location.href = "/login"; // Redirect after logout
};

// Forgot Password
export const forgotPassword = async (email) => {
  try {
    await instance.post("/auth/forgot-password", { email });
    toast.success("Password reset link sent to your email");
  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to send email");
  }
};

// Reset Password
export const resetPassword = async (token, password) => {
  try {
    await instance.post(`/auth/reset-password/${token}`, { password });
    toast.success("Password reset successful. Please login.");
  } catch (error) {
    console.error(
      "Reset Password Error:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Password reset failed");
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const response = await instance.get("/auth/check-auth");
    return response.data; // Returns userId and role if valid
  } catch (error) {
    localStorage.removeItem("token");
    return false;
  }
};

// Update Profile
export const updateProfile = async (userData) => {
  try {
    const response = await instance.put("/auth/update-profile", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; // Returns updated user data
  } catch (error) {
    console.error(
      "Update Profile Error:",
      error.response?.data || error.message
    );
    return false;
  }
};

// Load User (Fixed infinite loop issue)
export const loadUser = () => async (dispatch) => {
  try {
    const response = await instance.get("/auth/me", {
      withCredentials: true,
    });

    console.log("User Data on Refresh:", response.data); // ✅ Debugging

    dispatch(setUser(response.data.user)); // ✅ Store user in Redux
  } catch (error) {
    console.error(
      "Failed to load user:",
      error.response?.data || error.message
    );

    // **Fix: Prevent infinite refresh loop**
    if (error.response?.status === 401) {
      dispatch(logoutUser()); // Log user out if unauthorized
      localStorage.clear();
    }
  }
};
