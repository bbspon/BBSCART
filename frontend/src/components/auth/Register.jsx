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
    confirmPassword: "",
    role: "customer", // hard-coded
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const validateRegister = () => {
    let formErrors = {};

    // Name: required, only alphabets and spaces
    if (!userData.name.trim()) {
      formErrors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(userData.name)) {
      formErrors.name = "Name must contain only letters";
    }

    // Email: required, valid pattern
    if (!userData.email.trim()) {
      formErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(userData.email)
    ) {
      formErrors.email = "Enter a valid email address";
    }

    // Phone: required, exactly 10 digits
    if (!userData.phone.trim()) {
      formErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(userData.phone)) {
      formErrors.phone = "Phone number must be 10 digits";
    }
    if (!userData.password) {
      formErrors.password = "Password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
        userData.password
      )
    ) {
      formErrors.password =
        "Min 8 chars: uppercase, lowercase, number & special.";
    }

    // Confirm password: must match
    if (!userData.confirmPassword) {
      formErrors.confirmPassword = "Confirm password is required";
    } else if (userData.confirmPassword !== userData.password) {
      formErrors.confirmPassword = "Passwords do not match";
    }

    return formErrors;
  };

  const handleChange = (e) => {
    console.log(`Field: ${e.target.name}, Value: ${e.target.value}`); // Debugging
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2  dark:text-gray-400 text-md"
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
                  {errors.name && <div className="text-red-800">{errors.name}</div>}
                </div>
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
                  {errors.email && <div className="text-red-800">{errors.email}</div>}
                </div>
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
                  {errors.phone && <div className="text-red-800">{errors.phone}</div>}
                </div>
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
                  {errors.password && <div className="text-red-800">{errors.password}</div>}
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 dark:text-gray-400 text-md"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full placeholder-gray-300 ${
                      errors.confirmPassword ? "border-red-700" : ""
                    }`}
                    type="password"
                    placeholder="********"
                    onChange={handleChange}
                    value={userData.confirmPassword}
                  />
                  {errors.confirmPassword && <div className="text-red-800">{errors.confirmPassword}</div>}
                </div>

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
