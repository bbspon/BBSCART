import React, { useEffect, useState } from 'react';
import { updateProfile } from '../../services/authService';
import Select from "react-select";
import { GetCountries, GetState, GetCity } from "react-country-state-city";
import toast from "react-hot-toast";
import { useSelector } from 'react-redux';

function MyAccount() {
    
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [imagePreview, setImagePreview] = useState("http://i.pravatar.cc/500?img=7");

    console.log(user)

    const [userData, setUserData] = useState({
        name: "",
        address: { street: "", city: "", state: "", postalCode: "", country: "" },
    });

    useEffect(() => {
        if (user) {
            setUserData(prev => ({
                ...prev,
                name: user.name || "",
                address: user?.details?.addresses || {
                    street: "",
                    city: "",
                    state: "",
                    postalCode: "",
                    country: "",
                },
                profilePic : user?.details?.profilePic || '', 
            }));     
            setImagePreview(user?.details?.profilePic ? import.meta.env.VITE_API_URL+''+user?.details?.profilePic:'');       
            // console.log('userInfo',userData);
        }
    }, [user]);

    useEffect(() => {
        const fetchCountries = async () => {
            const countryList = await GetCountries();
            if (Array.isArray(countryList)) {
                setCountries(countryList.map(country => ({ value: country.id, label: country.name })));
            }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        const fetchStates = async () => {
            const selectedCountry = countries.find(c => c.label === userData.address.country);
            if (selectedCountry) {
                const stateList = await GetState(selectedCountry.value);
                if (Array.isArray(stateList)) {
                    setStates(stateList.map(state => ({ value: state.id, label: state.name })));
                } else {
                    setStates([]);
                }
            }
        };
        if (userData.address.country) fetchStates();
    }, [userData.address.country, countries]);

    useEffect(() => {
        const fetchCities = async () => {
            const selectedCountry = countries.find(c => c.label === userData.address.country);
            const selectedState = states.find(s => s.label === userData.address.state);
            
            if (selectedCountry && selectedState) {
                const cityList = await GetCity(selectedCountry.value, selectedState.value);
                if (Array.isArray(cityList)) {
                    setCities(cityList.map(city => ({ value: city.id, label: city.name })));
                } else {
                    setCities([]);
                }
            }
        };
        if (userData.address.state) fetchCities();
    }, [userData.address.state, states]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setUserData((prevData) => {
            const updatedData = {
                ...prevData,
                [name]: value,  // For firstName, lastName, and other fields
                address: { 
                    ...prevData?.address, 
                    [name]: value // For address fields like street, postalCode
                }
            };
            console.log(updatedData); // Logs the correct updated state
            return updatedData;
        });
    };
    
    const handleSelectChange = (selectedOption, { name }) => {
        setUserData((prevData) => {
            const updatedData = {
                ...prevData,
                address: { 
                    ...prevData?.address, 
                    [name]: selectedOption?.label || '' // Prevents issues if null
                }
            };
            console.log(updatedData); // Logs the correct updated state
            return updatedData;
        });
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting User Data:", userData);
    
        const data = await updateProfile(userData);
    
        if (data) {
            console.log("Profile updated successfully:", data);
            toast.success(data.message);
        } else {
            console.log("Failed to update profile");
            toast.error(data.message);
        }
    };

    const handleImageChange = (event) => {
    const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
            setImagePreview(reader.result);
            setUserData((prev) => ({
                ...prev,
                profilePic: file, // Store base64 image in userDetails.profilePic
            }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <>
            <div className="input-box-form w-[90%] mx-auto mt-[20px]">
                <h4 className="font-quicksand tracking-[0.03rem] leading-[1.2] text-[20px] font-bold text-secondary mt-8 mb-4">Profile Details</h4>
                <form onSubmit={handleSubmit}>
                    <div>
                        <div className="avatar-upload">
                            <div className="avatar-edit">
                                <input
                                type="file"
                                id="imageUpload"
                                accept=".png, .jpg, .jpeg"
                                onChange={handleImageChange}
                                />
                                <label htmlFor="imageUpload"></label>
                            </div>
                            <div className="avatar-preview">
                                <div id="imagePreview" style={{ backgroundImage: `url(${imagePreview})` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap mx-[-12px]">
                        {/* First Name */}
                        <div className="min-[992px]:w-[50%] w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">First Name *</label>
                                <input 
                                    type="text" 
                                    name="firstName" 
                                    placeholder="Enter your First Name" 
                                    className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]" 
                                    value={userData?.name || ''} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Last Name */}
                        <div className="min-[992px]:w-[50%] w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Last Name *</label>
                                <input 
                                    type="text" 
                                    name="lastName" 
                                    placeholder="Enter your Last Name" 
                                    className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]" 
                                    value={userData?.lastName || ''} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Address *</label>
                                <input type="text" name="street" onChange={handleChange} value={userData?.address?.street || ""} placeholder="Address Line 1" className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]" required />
                            </div>
                        </div>                                            

                        {/* Country Dropdown */}
                        <div className="min-[992px]:w-[50%] w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Country *</label>
                                <Select
                                    options={countries}
                                    value={countries.find(option => option.label === userData?.address?.country) || null}
                                    onChange={(option, action) => handleSelectChange(option, { name: "country" })}
                                    placeholder="Select Country"
                                    isSearchable
                                    className="w-full border rounded-lg"
                                    name="country"
                                />
                            </div>
                        </div>

                        
                        {/* Region/State Dropdown */}
                        <div className="min-[992px]:w-[50%] w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">State *</label>
                                <Select
                                    options={states}
                                    value={states.find(option => option.label === userData?.address?.state) || null}
                                    onChange={(option, action) => handleSelectChange(option, { name: "state" })}
                                    placeholder="Select Region/State"
                                    isSearchable
                                    className="w-full border rounded-lg"
                                    name="state"
                                />
                            </div>
                        </div>

                        {/* City Dropdown */}
                        <div className="min-[992px]:w-[50%] w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">City *</label>
                                <Select
                                    options={cities}
                                    value={cities.find(option => option.label === userData?.address?.city) || null}
                                    onChange={(option, action) => handleSelectChange(option, { name: "city" })}
                                    placeholder="Select City"
                                    isSearchable
                                    className="w-full border rounded-lg"
                                    name="city"
                                />
                            </div>
                        </div>

                        {/* Post Code */}
                        <div className="min-[992px]:w-[50%] w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Post Code *</label>
                                <input type="text" name="postalCode" onChange={handleChange} value={userData?.address?.postalCode ?? ''} placeholder="Post Code" className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]" required />
                            </div>
                        </div>

                        {/* Update Profile Button */}
                        <div className="w-full px-[12px]">
                            <div className="input-button">
                                <button type="submit" className="bb-btn-2 inline-block py-[10px] px-[25px] text-[14px] font-medium text-white bg-[#6c7fd8] rounded-[10px] hover:bg-transparent hover:border-[#3d4750] hover:text-secondary border">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default MyAccount