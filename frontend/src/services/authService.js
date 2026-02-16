
import toast from "react-hot-toast";
import { logoutUser, setUser } from "../slice/authSlice";
import instance from "../services/axiosInstance";

// Register function
export const register = async (userData, dispatch, navigate) => {
  try {
    const response = await instance.post(
      `${import.meta.env.VITE_API_URL}/api/auth/register`,
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

      // Redux
      dispatch(setUser(user));

      // Token
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // User Data
      if (response.data.user) {
        localStorage.setItem("userData", JSON.stringify(response.data.user));
      }

      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user._id);

      // ⭐ Store full user
      localStorage.setItem("auth_user", JSON.stringify(user));

      // ⭐⭐⭐ Store phone number (NEW LINE)
      localStorage.setItem("phone", user.phone || user.mobile || "");

      console.log("User role in production:", user.role);
      toast.success("Login successful");

      // Redirect
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




// Request OTP for mobile login
export const requestOtp = async (mobile) => {
  try {
    const res = await instance.post("/auth/login/otp/send", { mobile });
    if (res.data && res.data.success) {
      toast.success("OTP sent to your mobile number");
      return true;
    }
  } catch (err) {
    console.error("OTP request failed", err.response?.data || err.message);
    toast.error(err.response?.data?.message || "Failed to send OTP");
  }
  return false;
};

// Verify OTP and perform login
export const verifyOtp = async (dispatch, mobile, otp, navigate) => {
  try {
    const response = await instance.post(
      "/auth/login/otp/verify",
      { mobile, otp },
      { withCredentials: true }
    );

    if (response.status === 200 && response.data?.user) {
      const user = response.data.user;

      // Redux updates
      dispatch(setUser(user));

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("auth_user", JSON.stringify(user));
      localStorage.setItem("phone", user.phone || user.mobile || "");

      toast.success("Login successful");
      if (user.role === "admin" || user.role === "seller") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

      return user;
    } else {
      throw new Error("Invalid OTP login response");
    }
  } catch (error) {
    console.error("OTP verify error", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "OTP login failed");
  }
};

// Logout function
export const logout = async (dispatch) => {
  // clear client state straight away so UI isn't waiting on the network
  try {
    localStorage.clear();
    dispatch(logoutUser());
  } catch (err) {
    console.error("Error clearing client state during logout", err);
  }

  // send request in the background; give the call a short timeout to avoid long hangs in production
  instance
    .post("/auth/logout", null, { timeout: 10000 })
    .catch((error) => {
      console.error(
        "Logout API failed:",
        error.response?.data?.message || error.message
      );
    });
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
// Update Profile
export const updateProfile = async (formData) => {
  try {
    const token = localStorage.getItem("token");

    const res = await instance.put(
      "/auth/update-profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
          withCredentials: true,
      }
    );

    return res.data;

  } catch (err) {
    console.error("Update Profile Error:", err.response?.data || err.message);
    return err.response?.data || { success: false, message: "Update failed" };
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
