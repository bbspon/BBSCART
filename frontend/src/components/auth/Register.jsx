import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { register } from "../../services/authService";
import { useDispatch } from "react-redux";

const Register = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "", // new field
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const validateRegister = () => {
    let formErrors = {};
    if (!userData.name) formErrors.name = "Name is required";
    if (!userData.email) formErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(userData.email))
      formErrors.email = "Email is invalid";
    if (!userData.phone) formErrors.phone = "Phone is required";
    if (!userData.password) formErrors.password = "Password is required";
    else if (userData.password.length < 6)
      formErrors.password = "Password must be at least 6 characters";
    if (!userData.role) formErrors.role = "Role is required";
    return formErrors;
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegister();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors and try again.");
      return;
    }

    try {
      await register(userData, dispatch, navigate);
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <>
      <div className="h-100 w-screen flex justify-center items-center dark:bg-gray-900 py-10">
        <div className="grid gap-8">
          <div
            id="back-div"
            className="bg-gradient-to-r from-logoSecondary to-logoPrimary rounded-[26px] m-4"
          >
            <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-5 2xl:p-5 lg:p-5 md:p-5 sm:p-2 m-2">
              <h1 className="pt-8 pb-6 font-bold dark:text-gray-400 text-3xl text-center cursor-default">
                Sign up
              </h1>
              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 dark:text-gray-400 text-md"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    className={`border p-3 dark:bg-indigo-700 dark:text-gray-300  dark:border-gray-700 shadow-md placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full placeholder-gray-300 ${
                      errors.name ? "border-red-700" : ""
                    }`}
                    type="text"
                    placeholder="John Deo"
                    onChange={handleChange}
                    value={userData.name}
                  />
                  {errors.name && (
                    <div className="text-red-800">{errors.name}</div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2  dark:text-gray-400 text-md"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    className={`border p-3 dark:bg-indigo-700 dark:text-gray-300  dark:border-gray-700 shadow-md placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full placeholder-gray-300 ${
                      errors.email ? "border-red-700" : ""
                    }`}
                    type="email"
                    placeholder="example@abc.com"
                    onChange={handleChange}
                    value={userData.email}
                  />
                  {errors.email && (
                    <div className="text-red-800">{errors.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 dark:text-gray-400 text-md"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    className={`border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300  dark:border-gray-700 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full placeholder-gray-300 ${
                      errors.phone ? "border-red-700" : ""
                    }`}
                    type="text"
                    placeholder="88888 88888"
                    onChange={handleChange}
                    value={userData.phone}
                  />
                  {errors.phone && (
                    <div className="text-red-800">{errors.phone}</div>
                  )}
                </div>

                {/* Role Dropdown */}
                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 dark:text-gray-400 text-md"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    className={`border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 
                                            dark:border-gray-700 placeholder:text-base focus:scale-105 ease-in-out duration-300 
                                            border-gray-300 rounded-lg w-full ${
                                              errors.role
                                                ? "border-red-700"
                                                : ""
                                            }`}
                    value={userData.role}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Role --</option>
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="franchise">Franchise</option>
                    <option value="admin">Admin</option>
                  </select>
                  {errors.role && (
                    <div className="text-red-800">{errors.role}</div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 dark:text-gray-400 text-md"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      className={`border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full placeholder-gray-300 ${
                        errors.password ? "border-red-700" : ""
                      }`}
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      onChange={handleChange}
                      value={userData.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-300"
                    >
                      <i
                        className={
                          showPassword ? "ri-eye-off-line" : "ri-eye-line"
                        }
                      ></i>
                    </button>
                  </div>
                  {errors.password && (
                    <div className="text-red-800">{errors.password}</div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  className="bg-gradient-to-r dark:text-gray-300 from-logoSecondary to-logoPrimary shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 hover:from-logoPrimary hover:to-logoSecondary transition duration-300 ease-in-out"
                  type="submit"
                >
                  REGISTER
                </button>
              </form>

              {/* Already have account */}
              <div className="flex flex-col mt-4 items-center justify-center text-sm">
                <h3 className="dark:text-gray-300">
                  Already have an account?
                  <Link
                    className="group text-primary transition-all duration-100 ease-in-out"
                    to="/login"
                  >
                    <span className="bg-left-bottom bg-gradient-to-r from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out mx-2">
                      Sign In
                    </span>
                  </Link>
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
