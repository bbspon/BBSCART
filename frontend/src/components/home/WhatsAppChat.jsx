
const WhatsAppChat = () => {
  return (
    <a
      href="https://wa.me/9600729596" // Replace with your number
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transition-all duration-300"
    >
      <i className="ri-whatsapp-line text-2xl md:text-4xl"></i>
    </a>
  );
};

export default WhatsAppChat;
