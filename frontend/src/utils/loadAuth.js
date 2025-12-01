import { setUser } from "../slice/authSlice";

export const loadAuthFromStorage = () => (dispatch) => {
  try {
    const stored = localStorage.getItem("auth_user");
    if (!stored) return;

    const parsed = JSON.parse(stored);

    // Only set if valid user exists
    if (parsed && parsed._id) {
      dispatch(setUser(parsed));
    }
  } catch (error) {
    console.log("Error loading auth user:", error);
  }
};
