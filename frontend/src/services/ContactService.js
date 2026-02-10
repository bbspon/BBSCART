import instance from "./axiosInstance";

const ContactService = {
  async sendContactMessage(contactData) {
    try {
      const response = await instance.post("/contact/send-message", {
        name: contactData.name,
        email: contactData.email,
        message: contactData.message,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending contact message:", error);
      throw error.response?.data || error;
    }
  },
};

export default ContactService;
