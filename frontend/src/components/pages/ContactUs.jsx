import React, { useState } from "react";
import toast from "react-hot-toast";
import ContactService from "../../services/ContactService";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    setLoading(true);
    try {
      const response = await ContactService.sendContactMessage(formData);
      toast.success(response.message || "Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center px-6 py-12">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Get in Touch</h1>
      <p className="text-gray-600 text-center max-w-lg mb-8">
        Need help? Reach out via phone, email, WhatsApp, or drop us a message!
      </p>

      {/* Contact Info + Form */}
      <div className="grid lg:grid-cols-2 gap-10 w-full max-w-5xl">
        {/* Left: Contact Info + Map */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Contact Information</h2>
          <div className="space-y-4 text-base text-gray-700">
            <p><i className="ri-phone-line mr-2 text-primary"></i> <a href="tel:+914134068916">+91 413 406 8916</a></p>
            <p><i className="ri-whatsapp-line mr-2 text-primary"></i> <a href="https://wa.me/9600729596">+91 96007 29596</a></p>
            <p><i className="ri-mail-line mr-2 text-primary"></i> <a href="mailto:info@bbscart.com">info@bbscart.com</a></p>
            <p><i className="ri-map-pin-line mr-2 text-primary"></i> Floor,1st,7,2nd Cross,Bharathy Street,Anna Nagar,Puducherry,605005</p>
          </div>

          {/* Map */}
          <div className="w-full h-44 rounded-lg overflow-hidden shadow-lg mt-5">
         <iframe
  title="BBSCART Location"
  src="https://www.google.com/maps?q=Floor,1st,7,2nd+Cross,Bharathy+Street,Anna+Nagar,Puducherry,605005&output=embed"
  width="100%"
  height="250"
  style={{ border: 0, borderRadius: "12px" }}
  allowFullScreen=""
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>

          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" 
              name="name"
              placeholder="Your Name" 
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100" 
            />
            <input 
              type="email" 
              name="email"
              placeholder="Your Email" 
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100" 
            />
            <textarea 
              name="message"
              placeholder="Your Message" 
              rows="6" 
              value={formData.message}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
            ></textarea>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-logoSecondary to-logoPrimary text-white py-2 rounded-lg w-full hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      {/* Social Media Icons */}
      <div className="flex space-x-6 mt-8 text-3xl">
        <a href="https://www.facebook.com/profile.php?id=100090804256179" className="text-blue-600">
          <i className="ri-facebook-circle-fill"></i>
        </a>
        <a href="https://www.instagram.com/bbscart/?hl=en" className="text-pink-500">
          <i className="ri-instagram-fill"></i>
        </a>
        <a href="https://wa.me/914134068916" className="text-green-500">
          <i className="ri-whatsapp-fill"></i>
        </a>
        <a href="https://www.linkedin.com/in/bbscart-online-shopping-50a171355/" className="text-blue-700">
          <i className="ri-linkedin-fill"></i>
        </a>
        <a href="https://www.youtube.com/channel/UCNiBeRvAW1bQOUEcaqc0hYA" className="text-red-600">
          <i className="ri-youtube-fill"></i>
        </a>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mt-12 text-left">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="bg-gray-100 p-4 rounded-lg cursor-pointer" open>
            <summary className="font-semibold">How long does shipping take?</summary>
            <p className="text-gray-600 mt-2">Typically 7–10 business days, depending on your location.</p>
          </details>
          <details className="bg-gray-100 p-4 rounded-lg cursor-pointer">
            <summary className="font-semibold">Can I return a product?</summary>
            <p className="text-gray-600 mt-2">Yes, return eligible products within 7 days of delivery.</p>
          </details>
          <details className="bg-gray-100 p-4 rounded-lg cursor-pointer">
            <summary className="font-semibold">How can I track my order?</summary>
            <p className="text-gray-600 mt-2">You'll receive a tracking number via email once shipped.</p>
          </details>
        </div>
      </div>
    </div>
  );
}
