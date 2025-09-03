import { useState } from "react";
import Modal from "react-modal";
import { vendoDecline } from "../../services/vendorService";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import moment from "moment";
import FilePreview from "../layout/FilePreview";

const ViewUserRequest = ({vendorData , onApprove, setIsApproveModalOpen}) => {    
    console.log('ViewUserRequest',vendorData);
    let label = {};
    switch (vendorData.role) {
        case 'seller':
            label = {
                othersecheading: 'Supermarket Outlets Locations',
                othersecname:'Store Manager Name',
                referral: 'Referral ID',
                bio:'Brief Vendor Bio/Description',
            };
            break;
        case 'agent':
            label = {
                othersecheading: 'Agent Locations',
                othersecname:'Agent Area Manager Name',
                referral: 'Referred by (Franchisee ID / Territory Head ID / Direct)',
                bio:'Brief Agent Bio/Description',
            };
            break;
        case 'territory_head':
            label = {
                othersecheading: 'Zone Supervision',
                othersecname:'Contact Person Name',
                referral: '',
                bio:'Brief Territory Head Bio/Description',
            };
            break;
        case 'franchise_head':
            label = {
                othersecheading: 'Territory Head Area Responsibility',
                othersecname:'Contact Person Name',
                referral: '',
                bio:'Brief Franchise Head Bio/Description',
            };
    }
    const navigate = useNavigate();
    const [isDeclineModalOpen, setIsDeclinModalOpen] = useState(false);
    const [declineData, setDeclineData] = useState({
        user_id: '', decline_reason: ''
    });
    const handleDeclineOpen = (vendorData) => {
        setDeclineData((prevData) => ({
            ...prevData,
            user_id: vendorData._id,
        }));
        setIsDeclinModalOpen(true);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setDeclineData((prev) => ({
        ...prev,
        [name]: value || "", // Ensuring empty string instead of undefined
        }));
        console.log('declineData handleChange',declineData);
    };
    const handleDeclineSubmit = async (e) => {
        e.preventDefault();
        console.log('declineData',declineData);
        try {
            const res = await vendoDecline(declineData);
            if(res.success === true){
                console.log('handleDeclineSubmit',res.message);
                toast.success("Decline Done");
                navigate("/");
            }
        } catch (error) {
            toast.error(error.message || "Agent registration failed. Try again.");
        }
    }
    return (
        <>
            <div className="flex justify-center items-center dark:bg-gray-900 py-10 ">
                <div className="grid gap-8 max-w-[991px] w-full">
                    <div id="back-div" className="bg-gradient-to-r from-logoSecondary to-logoPrimary rounded-[26px] m-4">
                        <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg p-5 m-2">
                            <div className="h-[85vh] overflow-auto relative">
                                <span className="popup-close" onClick={() => setIsApproveModalOpen(false)}><i className="ri-close-circle-line"></i></span>       
                                <h1 className="pt-8 pb-6 font-bold dark:text-gray-400 text-3xl text-center">
                                    User Request
                                </h1>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4">
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">First Name : {vendorData?.vendor_fname}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Last Name : {vendorData?.vendor_lname}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Date Of Birth : {moment(vendorData?.dob).format("DD-MM-YYYY") || "-"}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Business Type : {vendorData?.business_type}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Business / Store Name : {vendorData?.brand_name}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Primary Contact Name : {vendorData?.contact_person}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Email : {vendorData?.email}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Primary Contact Mobile : {vendorData?.mobile}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Contact Person Alternative Mobile : {vendorData?.atl_mobile}</span>
                                    </div>                            
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Education Qualification : {vendorData?.education_qualify}</span>
                                    </div>                            
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Work Experience : {vendorData?.work_experience}</span>
                                    </div>                            
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">{label.referral} : {vendorData?.referral_details}</span>
                                    </div>                            
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Language Proficiency : {vendorData?.lang_proficiency}</span>
                                    </div>                                    
                                    {vendorData?.self_declaration && (  
                                        <FilePreview filePath={vendorData?.self_declaration} label="Upload Signed Self-Declaration" className="col-span-2"/>
                                    )}
                                       
                                    <h3 className="col-span-3 block text-[18px] font-medium text-primary mt-[20px]  mb-[8px]">Register Business Address </h3>

                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Street : {vendorData?.register_business_address?.street}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">State : {vendorData?.register_business_address?.state}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">City : {vendorData?.register_business_address?.city}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Country : {vendorData?.register_business_address?.country}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Post Code : {vendorData?.register_business_address?.postalCode}</span>
                                    </div>
                                    
                                    <h3 className="col-span-3 block text-[18px] font-medium text-primary mt-[20px]  mb-[8px]">Operational Address </h3>

                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Street : {vendorData?.operational_address?.street}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">State : {vendorData?.operational_address?.state}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">City : {vendorData?.operational_address?.city}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Country : {vendorData?.operational_address?.country}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Post Code : {vendorData?.operational_address?.postalCode}</span>
                                    </div>
                                    
                                    <h3 className="col-span-3 block text-[18px] font-medium text-primary mt-[20px]  mb-[8px]">Legal & Tax Information </h3>
                                    
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">PAN Number : {vendorData?.pan_number}</span>
                                    </div>
                                    {vendorData?.pan_pic && (  
                                        <FilePreview filePath={vendorData?.pan_pic} label="PAN PIC" className="col-span-1"/>
                                    )}
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">GST NUMBER : {vendorData?.gst_number}</span>
                                    </div>
                                    {vendorData?.gst_pic && (  
                                        <FilePreview filePath={vendorData?.gst_pic} label="GST PIC" className="col-span-1"/>
                                    )}
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">FSSAI LICENSE : {vendorData?.fssai_license}</span>
                                    </div>
                                    {vendorData?.fssai_pic && (  
                                        <FilePreview filePath={vendorData?.fssai_pic} label="FSSAI PIC" className="col-span-1"/>
                                    )}
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">SHOP ESTABLISH LICENSE : {vendorData?.shop_establish_license}</span>
                                    </div>
                                    {vendorData?.shop_establish_pic && (  
                                        <FilePreview filePath={vendorData?.shop_establish_pic} label="SHOP ESTABLISH PIC" className="col-span-1"/>
                                    )}
                                    
                                    
                                    <h3 className="col-span-3 block text-[18px] font-medium text-primary mt-[20px]  mb-[8px]">{label.othersecheading}</h3>

                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">{label.othersecname} : {vendorData?.outlet_manager_name}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Contact Number : {vendorData?.outlet_contact_no}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Street : {vendorData?.outlet_location?.street}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">State : {vendorData?.outlet_location?.state}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">City : {vendorData?.outlet_location?.city}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Country : {vendorData?.outlet_location?.country}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Post Code : {vendorData?.outlet_location?.postalCode}</span>
                                    </div>

                                    <h3 className="col-span-3 block text-[18px] font-medium text-primary mt-[20px]  mb-[8px]">Bank & Payment Details</h3>

                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Bank Name : {vendorData?.bank_name}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Account Holder’s Name : {vendorData?.account_holder_name}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Account Number : {vendorData?.account_no}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">IFSC Code : {vendorData?.ifcs_code}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Branch Name : {vendorData?.branch_name}</span>
                                    </div>
                                    {vendorData?.cancel_cheque_passbook && (  
                                        <FilePreview filePath={vendorData?.cancel_cheque_passbook} label="Cancelled Cheque/Passbook Upload" className="col-span-1"/>
                                    )}

                                    <h3 className="col-span-3 block text-[18px] font-medium text-primary mt-[20px]  mb-[8px]">Vendor Profile</h3>
                                    {vendorData?.profile_pic && (  
                                        <FilePreview filePath={vendorData?.profile_pic} label="Profile Picture/Logo" className="col-span-1"/>
                                    )}
                                    {vendorData?.cover_pic && (  
                                        <FilePreview filePath={vendorData?.cover_pic} label="Cover Image for Storefront" className="col-span-1"/>
                                    )}
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">{label.bio} : {vendorData?.vendor_bio}</span>
                                    </div>
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Product Category : {vendorData?.product_category}</span>
                                    </div>             
                                    <div className="col-span-1 mt-3">
                                        <span className="block text-[14px] font-medium text-secondary">Specify Category : {vendorData?.product_category_other}</span>
                                    </div>     
                                    {vendorData?.address_proof && (  
                                        <FilePreview filePath={vendorData?.address_proof} label="Address Proof (Utility Bill/Rent Agreement)" className="col-span-1"/>
                                    )}
                                </div>                                
                                {!vendorData.is_decline ? (
                                    <>
                                    <div className="flex gap-2 max-w-[300px] mx-auto">
                                        <button className="bg-green-700 text-white block mx-auto my-3 w-min px-4 py-1 rounded-md"  onClick={() => onApprove(vendorData)}> Approve </button>
                                        <button className="bg-red-500 text-white block mx-auto my-3 w-min px-4 py-1 rounded-md" onClick={() => handleDeclineOpen(vendorData)}> Decline </button>
                                    </div>
                                    </>
                                    ) 
                                    : 
                                    (
                                        <div className="w-max mx-auto my-3 py-2 px-6 text-[18px] bg-red-600 text-white text-center rounded-md italic font-semibold">This request was declined for this reason: {vendorData.decline_reason}</div>
                                    )
                                }   
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                isOpen={isDeclineModalOpen}
                onRequestClose={() => setIsDeclinModalOpen(false)}
                shouldCloseOnOverlayClick={true}
                shouldCloseOnEsc={true}
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <div className="bg-white rounded-[20px] shadow-lg p-3">
                    <div className="relative">
                        <span className="popup-close" onClick={() => setIsDeclinModalOpen(false)}><i className="ri-close-circle-line"></i></span>
                    </div>
                    <div className="formSec m-auto">
                        <h1 className="text-2xl font-bold text-center mt-6">Reason for Decline</h1>
                        <form className="grid grid-cols-2 m-auto px-6 pb-5 gap-x-4" onSubmit={handleDeclineSubmit} encType="multipart/form-data">
                            <div className="col-span-2 mt-3">
                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Reason</label>
                                <textarea
                                    name="decline_reason"
                                    placeholder="Enter Decline Reason"
                                    className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]"
                                    value={declineData.decline_reason}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-span-2">
                                <button className="bg-gradient-to-r from-logoSecondary to-logoPrimary shadow-lg mt-6 p-[9.85px] text-white rounded-lg w-full">
                                    Confirm Decline
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ViewUserRequest;