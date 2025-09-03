import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { GetCountries, GetState, GetCity } from "react-country-state-city";
import useAddress from "../admin/hooks/useAddress";
import { vendorRegister } from "../../services/vendorService";

const CustomerBecomeVendor = () => {
    
    const [vendorData, setVendorData] = useState({
        vendor_fname: '', vendor_lname: '', dob: '', education_qualify: '', work_experience: '', referral_details: '', lang_proficiency: '', aadhar_number: '', business_type: '', brand_name: '', contact_person: '', email: '', mobile: '', register_business_address: { street: "", city: "", state: "", postalCode: "", country: "" }, operational_address: { street: "", city: "", state: "", postalCode: "", country: "" }, pan_number: '', gst_number: '', fssai_license: '', shop_establish_license: '', outlet_location: { street: "", city: "", state: "", postalCode: "", country: "" },outlet_manager_name: '', outlet_contact_no: '', bank_name: '', account_holder_name: '', account_no: '', ifcs_code: '', branch_name: '', cancel_cheque_passbook: '', passbook: '', vendor_bio: '', product_category: '', product_category_other: '', address_proof: '', termsConditions: false, privacyPolicy: false, sellerPolicy: false, role: 'cbv',
    });

    const { user, isAuthenticated } = useSelector((state) => state.auth);
    useEffect(() => {
        if (user) {
            setVendorData(prev => ({
                ...prev,
                vendor_fname: user.name || "",
                email: user.email || "",
            }));     
        }
        console.log('CBV User',user);
    }, [user]);

    // const [files, setFiles] = useState({
    //     pan_pic: null, gst_pic: null, fssai_pic: null,
    //     shop_establish_pic: null, cancel_cheque_passbook: null, passbook: null,
    //     profile_pic: null, cover_pic: null
    // });

    const [data, setData] = useState({
        aadhar_number: '',pan_number: ''
    });
    
    const [files, setFiles] = useState({
        aadhar_pic: null, pan_pic: null,  cancel_cheque_passbook: null, passbook: null, profile_pic: null, cover_pic: null, address_proof: null, self_declaration: null, criminal_history: null
    });

    const [imagePreviews, setImagePreviews] = useState({});

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { countries: businessCountries, states: businessStates, cities: businessCities } = useAddress(vendorData.register_business_address.country, vendorData.register_business_address.state);
    const { countries: operationalCountries, states: operationalStates, cities: operationalCities } = useAddress(vendorData.operational_address.country, vendorData.operational_address.state);

    const validateVendor = () => {
        let formErrors = {};
    
        // Basic validations
        if (!vendorData.vendor_fname) formErrors.vendor_fname = "First name is required";
        if (!vendorData.vendor_lname) formErrors.vendor_lname = "Last name is required";
        if (!vendorData.dob) formErrors.dob = "Date of Birth is required";      
        if (!vendorData.email) formErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(vendorData.email)) formErrors.email = "Invalid email";
        if (!vendorData.mobile) formErrors.mobile = "Mobile number is required";
        if (!vendorData.termsConditions) formErrors.termsConditions = "You must agree to terms & conditions";
        if (!vendorData.privacyPolicy) formErrors.privacyPolicy = "You must agree to privacy policy";
        if (!vendorData.sellerPolicy) formErrors.sellerPolicy = "You must agree to vendor policy";    
        if (!vendorData.bank_name) formErrors.bank_name = "Bank name is required";
        if (!vendorData.account_holder_name) formErrors.account_holder_name = "Account holder’s name is required";
        if (!vendorData.account_no) formErrors.account_no = "Account number is required";
        if (!vendorData.ifcs_code) formErrors.ifcs_code = "IFSC code is required";
        if (!vendorData.branch_name) formErrors.branch_name = "Branch name is required";
        if (!files.address_proof) formErrors.address_proof = "Address proof is required";
        if (!vendorData.aadhar_number) formErrors.aadhar_number = "Aadhar number is required";
        if (!files.aadhar_pic) formErrors.aadhar_pic = "Aadhar picture is required"; 
        if (!vendorData.pan_number) formErrors.pan_number = "PAN number is required";
        if (!files.pan_pic) formErrors.pan_pic = "PAN picture is required";
        if (!files.self_declaration) formErrors.self_declaration = "Self declaration is required";
        if (!files.cancel_cheque_passbook) formErrors.cancel_cheque_passbook = "Cancelled Cheque/Passbook is required";
        
        if (!vendorData.vendor_bio) formErrors.vendor_bio = "Brief Vendor Bio/Description is required";        

        // Initialize nested objects if needed
        formErrors.register_business_address = {};
    
        // Register Business Address validations
        if (!vendorData.register_business_address?.street) {
            formErrors.register_business_address.street = "Register Business Address Street is required";
        }
        if (!vendorData.register_business_address?.city) {
            formErrors.register_business_address.city = "Register Business Address city is required";
        }
        if (!vendorData.register_business_address?.state) {
            formErrors.register_business_address.state = "Register Business Address state is required";
        }
        if (!vendorData.register_business_address?.postalCode) {
            formErrors.register_business_address.postalCode = "Register Business Address zipcode is required";
        }
        if (!vendorData.register_business_address?.country) {
            formErrors.register_business_address.country = "Register Business Address Country is required";
        }
    
        // Clean up empty nested error objects (optional)
        if (Object.keys(formErrors.register_business_address).length === 0) {
            delete formErrors.register_business_address;
        }
    
        return formErrors;
    };    

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
    
        if (name.includes('.')) {
            // If the name has a dot, it's an address field (e.g., register_business_address.street)
            const [section, field] = name.split('.');
    
            setVendorData((prevData) => ({
                ...prevData,
                [section]: {
                    ...prevData[section],
                    [field]: value, // Update the nested address field
                },
            }));
        } else {
            // If it's a regular field like vendor_fname
            setVendorData((prevData) => ({
                ...prevData,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };   
    

    // const handleFileChange = (e) => {
    //     setFiles({ ...files, [e.target.name]: e.target.files[0] });
    // };

    const handleSelectChange = (selectedOption, actionMeta) => {
        const { name } = actionMeta; // Extract name
        console.log("Selected:", selectedOption);
        console.log(selectedOption);
        setVendorData((prevData) => ({
            ...prevData,
            [name]: selectedOption.value,
        }));
    };

    const handleAddressSelectChange = (selectedOption, actionMeta) => {
        const { name } = actionMeta; // Extract field name (e.g., "country", "state", or "city")
        const [section, field] = name.split('.'); // Extract address type & field (e.g., "register_business_address", "country")
    
        setVendorData((prevData) => ({
            ...prevData,
            [section]: {
                ...prevData[section],
                [field]: selectedOption?.label || '' // Update only the relevant section
            }
        }));
    };

    const handleVendorSubmit = async (e) => {
        e.preventDefault();
    
        // Validate form
        const validationErrors = validateVendor();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Please fix the errors and try again.");
            return;
        }

    
        const formData = new FormData();
    
        // Append all vendorData fields, converting objects to JSON strings
        Object.entries(vendorData).forEach(([key, value]) => {
            if (typeof value === "object" && value !== null) {
                formData.append(key, JSON.stringify(value)); // Convert object to JSON string
            } else {
                formData.append(key, value);
            }
        });
    
        // Append file inputs
        Object.entries(files).forEach(([key, file]) => {
            if (file) {
                formData.append(key, file);
            }
        });
    
        console.log("handleVendorSubmit", Array.from(formData.entries())); // Debugging
    
        try {
            await vendorRegister(formData, dispatch, navigate);
            toast.success("Registration successful, Please wait for admin confirmation");
            navigate("/");
        } catch (error) {
            toast.error(error.message || "Vendor registration failed. Try again.");
        }
    };
    

    const handleSameAsReqAdd = (e) => {
        if (e.target.checked) {
            // If checked, copy register_business_address to operational_address
            setVendorData((prevData) => ({
                ...prevData,
                operational_address: { ...prevData.register_business_address }
            }));
        } else {
            // If unchecked, reset operational_address to empty
            setVendorData((prevData) => ({
                ...prevData,
                operational_address: {}
            }));
        }
    };

    const handleImageChange = (e) => {
        const { name } = e.target;
        const file = e.target.files[0];
    
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => ({
                    ...prev,
                    [name]: reader.result // Store image preview
                }));
                setFiles({ ...files, [name]: file });
            };
            reader.readAsDataURL(file);
        }
        console.log(files);
    };
    

    return (
        <div className="h-100 w-screen flex justify-center items-center dark:bg-gray-900 py-10">
            <div className="grid gap-8 max-w-[991px] w-full">
                <div id="back-div" className="bg-gradient-to-r from-logoSecondary to-logoPrimary rounded-[26px] m-4">
                    <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg p-5 m-2">
                        <h1 className="pt-8 pb-6 font-bold dark:text-gray-400 text-3xl text-center">
                            Customer Become A Vendor
                        </h1>
                        <form className="grid grid-cols-2 gap-x-4" onSubmit={handleVendorSubmit} encType="multipart/form-data">
                            {/* Vendor Name */}
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">First Name</label>
                                <input name="vendor_fname" type="text" placeholder="Enter First Name"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.vendor_fname ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.vendor_fname} />
                                {errors.vendor_fname && <div className="text-red-800">{errors.vendor_fname}</div>}
                            </div>
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Last Name</label>
                                <input name="vendor_lname" type="text" placeholder="Enter Last Name"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.vendor_lname ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.vendor_lname} />
                                {errors.vendor_lname && <div className="text-red-800">{errors.vendor_lname}</div>}
                            </div>
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Date Of Birth</label>
                                <input name="dob" type="date" placeholder="Select Date Of Birth"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.dob ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.dob} />
                                {errors.dob && <div className="text-red-800">{errors.dob}</div>}
                            </div>      
                            {/* Email */}
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Email</label>
                                <input name="email" type="email" placeholder="Enter Email"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.email ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.email} />
                                {errors.email && <div className="text-red-800">{errors.email}</div>}
                            </div>
                            {/* Mobile */}
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Primary Contact Mobile (with country code)</label>
                                <input name="mobile" type="text" placeholder="Enter Primary Contact Mobile"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.mobile ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.mobile} />
                                {errors.mobile && <div className="text-red-800">{errors.mobile}</div>}
                            </div>                            
                            {/* Alternative Mobile */}
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Contact Person Alternative Mobile</label>
                                <input name="alt_mobile" type="text" placeholder="Enter Contact Person Alternative Mobile"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.alt_mobile ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.alt_mobile} />
                                {errors.alt_mobile && <div className="text-red-800">{errors.alt_mobile}</div>}
                            </div>
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Education Qualification</label>
                                <input name="education_qualify" type="text" placeholder="Education Qualification"
                                    className={`border p-[9.85px] w-full rounded-lg`}
                                    onChange={handleChange} value={vendorData.education_qualify} />
                            </div>
                            
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Work Experience</label>
                                <input name="work_experience" type="text" placeholder="Work Experience"
                                    className={`border p-[9.85px] w-full rounded-lg`}
                                    onChange={handleChange} value={vendorData.work_experience} />
                            </div>

                            <div className="col-span-1 mt-3 relative">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Upload Signed Self-Declaration PDF<Link to="/files/SelfDeclarationForm.pdf" target="blank">(Download)</Link></label>
                                <input 
                                    type="file" 
                                    name="self_declaration"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.self_declaration ? 'border-red-700' : ''}`}
                                    onChange={handleImageChange} 
                                />
                                {/* Preview Button */}
                                {imagePreviews['self_declaration'] && (
                                <button 
                                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-center rounded-md absolute right-3"
                                    onClick={() => window.open(imagePreviews['self_declaration'], '_blank')}
                                >
                                    Preview
                                </button>
                                )}
                                {errors.self_declaration && <div className="text-red-800">{errors.self_declaration}</div>}
                            </div>
                            
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Language Proficiency</label>
                                <input name="lang_proficiency" type="text" placeholder="Work Experience"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.lang_proficiency ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.lang_proficiency} />
                                {errors.lang_proficiency && <div className="text-red-800">{errors.lang_proficiency}</div>}
                            </div>

                            <h3 className="col-span-2 block text-[18px] font-medium text-primary mt-[20px]  mb-[8px]">Register Business Address </h3>
                            {/* Register Business Address */}
                            <div className="col-span-2 w-full">
                                <div className="input-item mb-[8px]">
                                    <label className="block text-[14px] font-medium text-secondary mb-[8px]">Street</label>
                                    <input 
                                        type="text" 
                                        name="register_business_address.street" 
                                        onChange={handleChange} 
                                        value={vendorData?.register_business_address?.street || ""} 
                                        placeholder="Address Line 1" 
                                        className={`w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px] ${errors.register_business_address?.street ? 'border-red-700' : ''}`} 
                                    />
                                    {errors.register_business_address?.street && ( <div className="text-red-800">{errors.register_business_address.street}</div> )}
                                </div>
                            </div>                                            
    
                            {/* Country Dropdown */}
                            <div className="col-span-1 mt-3 w-full">
                                <div className="input-item mb-[8px]">
                                    <label className="block text-[14px] font-medium text-secondary mb-[8px]">Country</label>
                                    <Select
                                        options={businessCountries}
                                        value={businessCountries.find(option => option.label === vendorData.register_business_address?.country) || null}
                                        onChange={(option) => handleAddressSelectChange(option, { name: "register_business_address.country" })}
                                        placeholder="Select Country"
                                        className={`w-full border rounded-lg ${errors.register_business_address?.country ? 'border-red-700' : ''}`}
                                        isSearchable
                                    />
                                    {errors.register_business_address?.country && ( <div className="text-red-800">{errors.register_business_address?.country}</div> )}
                                </div>
                            </div>
    
                            
                            {/* Region/State Dropdown */}
                            <div className="col-span-1 mt-3 w-full">
                                <div className="input-item mb-[8px]">
                                    <label className="block text-[14px] font-medium text-secondary mb-[8px]">State</label>
                                    <Select
                                        options={businessStates}
                                        value={businessStates.find(option => option.label === vendorData.register_business_address?.state) || null}
                                        onChange={(option) => handleAddressSelectChange(option, { name: "register_business_address.state" })}
                                        placeholder="Select State"
                                        isSearchable
                                        className={`w-full border rounded-lg ${errors.register_business_address?.state ? 'border-red-700' : ''}`}
                                    />
                                    {errors.register_business_address?.state && ( <div className="text-red-800">{errors.register_business_address?.state}</div> )}
                                </div>
                            </div>
    
                            {/* City Dropdown */}
                            <div className="col-span-1 mt-3 w-full">
                                <div className="input-item mb-[8px]">
                                    <label className="block text-[14px] font-medium text-secondary mb-[8px]">City</label>
                                    <Select
                                        options={businessCities}
                                        value={businessCities.find(option => option.label === vendorData.register_business_address?.city) || null}
                                        onChange={(option) => handleAddressSelectChange(option, { name: "register_business_address.city" })}
                                        placeholder="Select City"
                                        isSearchable
                                        className={`w-full border rounded-lg ${errors.register_business_address?.city ? 'border-red-700' : ''}`}
                                    />
                                    {errors.register_business_address?.city && ( <div className="text-red-800">{errors.register_business_address?.city}</div> )}
                                </div>
                            </div>
    
                            {/* Post Code */}
                            <div className="col-span-1 mt-3 w-full">
                                <div className="input-item mb-[8px]">
                                    <label className="block text-[14px] font-medium text-secondary mb-[8px]">Post Code *</label>
                                    <input type="text" name="register_business_address.postalCode" onChange={handleChange} value={vendorData?.register_business_address?.postalCode ?? ''} placeholder="Post Code" className={`w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px] ${errors.register_business_address?.postalCode ? 'border-red-700' : ''}`} />
                                </div>
                                {errors.register_business_address?.postalCode && ( <div className="text-red-800">{errors.register_business_address?.postalCode}</div> )}
                            </div>                            

                            <h3 className="col-span-2 block text-[18px] font-medium text-primary mt-[20px]  mb-[8px]">Operational Address  </h3>
                            <div className="flex flex-wrap gap-2 items-center mb-3">
                                <input className="w-[15px] h-[15px]" type="checkbox" name="sameasreqadd" id="sameasreqadd" onClick={handleSameAsReqAdd} /> 
                                <label className="block text-[14px] font-medium text-secondary" htmlFor="sameasreqadd">Same as Registered Address</label>
                            </div>

                            {/* Operational Address */}
                            <div className="col-span-2 w-full">
                                <div className="input-item mb-[8px]">
                                    <label className="block text-[14px] font-medium text-secondary mb-[8px]">Street</label>
                                    <input 
                                        type="text" 
                                        name="operational_address.street" 
                                        onChange={handleChange} 
                                        value={vendorData?.operational_address?.street || ""} 
                                        placeholder="Address Line 1" 
                                        className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]"  
                                    />
                                </div>
                            </div>                                            
    
                            {/* Country Dropdown */}
                            <div className="col-span-1 mt-3 w-full">
                                <div className="input-item mb-[8px]">
                                    <label className="block text-[14px] font-medium text-secondary mb-[8px]">Country</label>
                                    <Select
                                        options={operationalCountries}
                                        value={operationalCountries.find(option => option.label === vendorData.operational_address.country) || null}
                                        onChange={(option) => handleAddressSelectChange(option, { name: "operational_address.country" })}
                                        placeholder="Select Country"
                                        isSearchable
                                        className="w-full border rounded-lg"
                                    />
                                </div>
                            </div>
    
                            
                            {/* Region/State Dropdown */}
                            <div className="col-span-1 mt-3 w-full">
                                <div className="input-item mb-[8px]">
                                    <label className="block text-[14px] font-medium text-secondary mb-[8px]">State</label>
                                    <Select
                                        options={operationalStates}
                                        value={operationalStates.find(option => option.label === vendorData.operational_address.state) || null}
                                        onChange={(option) => handleAddressSelectChange(option, { name: "operational_address.state" })}
                                        placeholder="Select State"
                                        isSearchable
                                        className="w-full border rounded-lg "
                                    />
                                </div>
                            </div>
    
                            {/* City Dropdown */}
                            <div className="col-span-1 mt-3 w-full">
                                <div className="input-item mb-[8px]">
                                    <label className="block text-[14px] font-medium text-secondary mb-[8px]">City</label>
                                    <Select
                                        options={operationalCities}
                                        value={operationalCities.find(option => option.label === vendorData.operational_address.city) || null}
                                        onChange={(option) => handleAddressSelectChange(option, { name: "operational_address.city" })}
                                        placeholder="Select City"
                                        isSearchable
                                        className="w-full border rounded-lg "
                                    />
                                </div>
                            </div>
    
                            {/* Post Code */}
                            <div className="col-span-1 mt-3 w-full">
                                <div className="input-item mb-[8px]">
                                    <label className="block text-[14px] font-medium text-secondary mb-[8px]">Post Code *</label>
                                    <input type="text" name="operational_address.postalCode" onChange={handleChange} value={vendorData?.operational_address?.postalCode ?? ''} placeholder="Post Code" className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]" />
                                </div>
                            </div>

                            <div className="col-span-2 mt-3"></div>
                            {/* File Inputs */}
                            {/* Map through keys and show text input + file input together */}
                            {Object.keys(data).map((key) => {
                                const fileKey = key.replace('_number', '_pic').replace('_license', '_pic');

                                return (
                                    <>
                                    <div key={key} className="col-span-1 mt-3 relative">
                                        {/* Text Input */}
                                        <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                                            {key.replace('_', ' ').toUpperCase()}
                                        </label>
                                        <input 
                                            type="text" 
                                            name={key} 
                                            value={vendorData.key} 
                                            onChange={handleChange} 
                                            className={`border p-[9.85px] w-full rounded-lg ${errors[key] ? 'border-red-700' : ''}`}
                                            
                                        />
                                        {errors[key] && <div className="text-red-800">{errors[key]}</div>}
                                    </div>  

                                    <div key={fileKey} className="col-span-1 mt-3 relative">
                                        {/* File Input */}
                                        <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                                            {fileKey.replace('_', ' ').toUpperCase()}
                                        </label>
                                        <input 
                                            type="file" 
                                            name={fileKey} 
                                            className={`border p-[9.85px] w-full rounded-lg ${errors[fileKey] ? 'border-red-700' : ''}`}
                                            onChange={handleImageChange} 
                                        />
                                        {/* Preview Button */}
                                        {imagePreviews[fileKey] && (
                                            <button 
                                                className="mt-2 px-3 py-1 bg-blue-500 text-white text-center rounded-md absolute right-3"
                                                onClick={() => window.open(imagePreviews[fileKey], '_blank')}
                                            >
                                                Preview
                                            </button>
                                        )}
                                        {errors[fileKey] && <div className="text-red-800">{errors[fileKey]}</div>}
                                    </div>
                                    </>
                                );
                            })}
                            
                            <h3 className="col-span-2 block text-[18px] font-medium text-primary mt-[20px]  mb-[8px]">Bank & Payment Details</h3>
                            
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Bank Name</label>
                                <input name="bank_name" type="text" placeholder="Enter Bank Name"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.bank_name ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.bank_name} />
                                {errors.bank_name && <div className="text-red-800">{errors.bank_name}</div>}
                            </div>                            
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Account Holder’s Name </label>
                                <input name="account_holder_name" type="text" placeholder="Enter Account Holder’s Name "
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.account_holder_name ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.account_holder_name} />
                                {errors.account_holder_name && <div className="text-red-800">{errors.account_holder_name}</div>}
                            </div>
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Account Number</label>
                                <input name="account_no" type="text" placeholder="Enter Account Number"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.account_no ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.account_no} />
                                {errors.account_no && <div className="text-red-800">{errors.account_no}</div>}
                            </div>                            
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">IFSC Code</label>
                                <input name="ifcs_code" type="text" placeholder="Enter IFSC Code"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.ifcs_code ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.ifcs_code} />
                                {errors.ifcs_code && <div className="text-red-800">{errors.ifcs_code}</div>}
                            </div>                    
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Branch Name</label>
                                <input name="branch_name" type="text" placeholder="Enter Branch Name"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.branch_name ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.branch_name} />
                                {errors.branch_name && <div className="text-red-800">{errors.branch_name}</div>}
                            </div>

                            <div className="col-span-1 mt-3 relative">
                                {/* Text Input */}
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Cancelled Cheque/Passbook Upload</label>
                                <input 
                                    type="file" 
                                    name="cancel_cheque_passbook"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.cancel_cheque_passbook ? 'border-red-700' : ''}`}
                                    onChange={handleImageChange} 
                                />

                                {/* Preview Button */}
                                {imagePreviews['cancel_cheque_passbook'] && (
                                    <button 
                                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-center rounded-md absolute right-3"
                                        onClick={() => window.open(imagePreviews['cancel_cheque_passbook'], '_blank')}
                                    >
                                        Preview
                                    </button>
                                )}
                                {errors.cancel_cheque_passbook && <div className="text-red-800">{errors.cancel_cheque_passbook}</div>}
                            </div>

                            <h3 className="col-span-2 block text-[18px] font-medium text-primary mt-[20px]  mb-[8px]">Profile</h3>                            

                            <div className="col-span-1 mt-3 relative">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Profile Picture/Logo</label>
                                <input 
                                    type="file" 
                                    name="profile_pic"
                                    className="border p-[9.85px] w-full rounded-lg" 
                                    onChange={handleImageChange} 
                                />
                                {/* Preview Button */}
                                {imagePreviews['profile_pic'] && (
                                    <button 
                                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-center rounded-md absolute right-3"
                                        onClick={() => window.open(imagePreviews['profile_pic'], '_blank')}
                                    >
                                        Preview
                                    </button>
                                )}
                            </div>          
                                             
                            <div className="col-span-1 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Brief Vendor Bio/Description</label>
                                <input name="vendor_bio" type="text" placeholder="Enter Brief Vendor Bio/Description"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.vendor_bio ? 'border-red-700' : ''}`}
                                    onChange={handleChange} value={vendorData.vendor_bio} />
                                {errors.vendor_bio && <div className="text-red-800">{errors.vendor_bio}</div>}
                            </div>


                            <div className="col-span-1 mt-3 relative">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Address Proof (Utility Bill/Rent Agreement)</label>
                                <input 
                                    type="file" 
                                    name="address_proof"
                                    className={`border p-[9.85px] w-full rounded-lg ${errors.address_proof ? 'border-red-700' : ''}`}
                                    onChange={handleImageChange} 
                                />
                                {/* Preview Button */}
                                {imagePreviews['address_proof'] && (
                                <button 
                                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-center rounded-md absolute right-3"
                                    onClick={() => window.open(imagePreviews['address_proof'], '_blank')}
                                >
                                    Preview
                                </button>
                                )}
                                {errors.address_proof && <div className="text-red-800">{errors.address_proof}</div>}
                            </div>

                            {/* Checkboxes for Agreement */}
                            <div className="col-span-2 mt-6">
                                <div className="flex flex-row gap-2 items-center">
                                    <input className="w-[15px] h-[15px]" type="checkbox" name="termsConditions" id="termsConditions" checked={vendorData.termsConditions} onChange={handleChange} /> 
                                    <label htmlFor="termsConditions"> I agree to BBSCART CBVA Terms & Conditions. {errors.termsConditions && <span className="text-red-800">{`(${errors.termsConditions})`}</span>} </label>
                                </div>
                                
                                <div className="flex flex-row gap-2 items-center">
                                    <input className="w-[15px] h-[15px]" type="checkbox" name="privacyPolicy" id="privacyPolicy" checked={vendorData.privacyPolicy} onChange={handleChange} /> 
                                    <label htmlFor="privacyPolicy">Acceptance of Privacy Policy. {errors.privacyPolicy && <span className="text-red-800">{`(${errors.privacyPolicy})`}</span>}</label>
                                </div>
                                
                                <div className="flex flex-row gap-2 items-center">
                                    <input className="w-[15px] h-[15px]" type="checkbox" name="sellerPolicy" id="sellerPolicy" checked={vendorData.sellerPolicy} onChange={handleChange} /> 
                                    <label htmlFor="sellerPolicy">Acceptance of CBVA Policy & Guidelines. {errors.sellerPolicy && <span className="text-red-800">{`(${errors.sellerPolicy})`}</span>}</label>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <button className="bg-gradient-to-r from-logoSecondary to-logoPrimary shadow-lg mt-6 p-[9.85px] text-white rounded-lg w-full">
                                    REGISTER AS CUSTOMER BECOME A VENDOR
                                </button>
                            </div>
                        </form>
                        <div className="text-sm text-center mt-4">
                            Already have an account? <Link to="/login" className="text-blue-500">Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerBecomeVendor;