import React, { useState } from "react";

const Checkout = () => {
  // Addresses with edit mode flag
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "John Doe",
      phone: "9876543210",
      addressLine1: "123, MG Road",
      addressLine2: "Bangalore, Karnataka",
      pincode: "560001",
      selected: true,
      isEditing: false,
    },
    {
      id: 2,
      name: "Jane Smith",
      phone: "9123456780",
      addressLine1: "456, Park Street",
      addressLine2: "Kolkata, West Bengal",
      pincode: "700016",
      selected: false,
      isEditing: false,
    },
  ]);

  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    pincode: "",
  });

  // Payment method state and toggles
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentDetailsVisible, setPaymentDetailsVisible] = useState({
    cod: false,
    card: false,
    upi: false,
    netbanking: false,
  });

  // Credit/Debit Card form states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Products in cart
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      price: 1200,
      quantity: 1,
      image:
        "https://tse3.mm.bing.net/th/id/OIP.A1JjNu8jIRxaTJHbD_EtFwHaIJ?cb=thfc1&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      id: 2,
      name: "Smart LED TV 42 inch",
      price: 25000,
      quantity: 1,
      image:
        "https://tse3.mm.bing.net/th/id/OIP.q3JCo-zLI3ugZQhgNyFoFwHaIt?cb=thfc1&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      id: 3,
      name: "Gaming Mouse",
      price: 1500,
      quantity: 1,
      image:
        "https://media.licdn.com/dms/image/D5612AQHQ9OUVQn8UGQ/article-cover_image-shrink_720_1280/0/1684773805107?e=2147483647&v=beta&t=iCWqpttgvwxq_kzGF9QR4HrmCtlBrjD0c7dh7oIFWUY",
    },
  ]);

  const [savedForLater, setSavedForLater] = useState([]);

  // Handlers for addresses
  const handleAddAddressChange = (field, value) => {
    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addNewAddress = () => {
    if (
      !newAddress.name.trim() ||
      !newAddress.phone.trim() ||
      !newAddress.addressLine1.trim() ||
      !newAddress.pincode.trim()
    ) {
      alert(
        "Please fill in all required fields (Name, Phone, Address, Pincode)"
      );
      return;
    }

    const id = Math.max(...addresses.map((a) => a.id)) + 1;

    const addressToAdd = {
      id,
      selected: false,
      isEditing: false,
      ...newAddress,
    };

    setAddresses((prev) => [...prev, addressToAdd]);
    setShowAddAddressForm(false);
    setNewAddress({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      pincode: "",
    });
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    }
  };

  const selectAddress = (id) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        selected: addr.id === id,
      }))
    );
  };

  const toggleAddressEdit = (id) => {
    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === id ? { ...addr, isEditing: !addr.isEditing } : addr
      )
    );
  };

  const handleAddressChange = (id, field, value) => {
    setAddresses((prev) =>
      prev.map((addr) => (addr.id === id ? { ...addr, [field]: value } : addr))
    );
  };

  // Cart product quantity and management
  const increaseQty = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p))
    );
  };

  const decreaseQty = (id) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
      )
    );
  };

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const saveForLater = (id) => {
    setProducts((prev) => {
      const productToSave = prev.find((p) => p.id === id);
      if (!productToSave) return prev;
      setSavedForLater((saved) => [...saved, productToSave]);
      return prev.filter((p) => p.id !== id);
    });
  };

  const moveToCart = (id) => {
    setSavedForLater((prev) => {
      const productToMove = prev.find((p) => p.id === id);
      if (!productToMove) return prev;
      setProducts((cart) => [...cart, productToMove]);
      return prev.filter((p) => p.id !== id);
    });
  };

  // Toggle payment details visibility
  const togglePaymentDetails = (method) => {
    setPaymentDetailsVisible((prev) => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  // Order totals
  const itemsCount = products.reduce((acc, p) => acc + p.quantity, 0);
  const price = products.reduce((acc, p) => acc + p.price * p.quantity, 0);
  const discount = 300;
  const deliveryCharges = 0;
  const totalAmount = price - discount + deliveryCharges;

  // Credit card input formatters
  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/^([2-9])$/g, "0$1")
      .replace(/^1([3-9])$/g, "01/$1")
      .replace(/^(\d{2})(\d{0,2}).*/, "$1/$2")
      .trim();
  };

  // Validate card inputs before order place
  const validateCardDetails = () => {
    if (
      !cardName.trim() ||
      cardNumber.replace(/\s/g, "").length !== 16 ||
      !expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/) ||
      cvv.length < 3
    ) {
      alert("Please fill in valid card details.");
      return false;
    }
    return true;
  };

  // Final order submit
  const handlePlaceOrder = () => {
    if (paymentMethod === "card") {
      if (!validateCardDetails()) return;
    }
    alert("Order placed successfully!");
    // Add further order submission logic here
  };

  return (
    <div className="max-w-6xl mx-auto my-6 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl text-center font-semibold mb-6">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Delivery Address */}
        <div className="flex-1 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>

          {addresses.map(
            ({
              id,
              name,
              phone,
              addressLine1,
              addressLine2,
              pincode,
              selected,
              isEditing,
            }) => (
              <div
                key={id}
                className={`border rounded p-4 mb-4 relative ${
                  selected ? "border-blue-600 bg-blue-50" : "border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{name}</h3>
                  <div className="flex items-center space-x-2">
                    {selected && (
                      <span className="text-blue-600 font-bold">Selected</span>
                    )}
                    <button
                      onClick={() => toggleAddressEdit(id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleAddressChange(id, "name", e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => handleAddressChange(id, "phone", e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) =>
                        handleAddressChange(id, "addressLine1", e.target.value)
                      }
                      className="w-full border rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) =>
                        handleAddressChange(id, "addressLine2", e.target.value)
                      }
                      className="w-full border rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => handleAddressChange(id, "pincode", e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                    <button
                      onClick={() => toggleAddressEdit(id)}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <p>{addressLine1}</p>
                    <p>{addressLine2}</p>
                    <p>Pincode: {pincode}</p>
                    <p>Phone: {phone}</p>
                  </>
                )}

                {!isEditing && !selected && (
                  <button
                    onClick={() => selectAddress(id)}
                    className="absolute top-4 left-40 text-md text-blue-600 hover:underline"
                  >
                    Select
                  </button>
                )}
              </div>
            )
          )}

          {!showAddAddressForm && (
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => setShowAddAddressForm(true)}
            >
              + Add New Address
            </button>
          )}
          {showAddAddressForm && (
            <div className="mt-4 border p-4 rounded bg-blue-50">
              <h3 className="text-lg font-semibold mb-3">Add New Address</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name *"
                  value={newAddress.name}
                  onChange={(e) => handleAddAddressChange("name", e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
                <input
                  type="text"
                  placeholder="Phone *"
                  value={newAddress.phone}
                  onChange={(e) => handleAddAddressChange("phone", e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
                <input
                  type="text"
                  placeholder="Address Line 1 *"
                  value={newAddress.addressLine1}
                  onChange={(e) => handleAddAddressChange("addressLine1", e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
                <input
                  type="text"
                  placeholder="Address Line 2"
                  value={newAddress.addressLine2}
                  onChange={(e) => handleAddAddressChange("addressLine2", e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
                <input
                  type="text"
                  placeholder="Pincode *"
                  value={newAddress.pincode}
                  onChange={(e) => handleAddAddressChange("pincode", e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />

                <div className="flex space-x-4">
                  <button
                    onClick={addNewAddress}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Save Address
                  </button>
                  <button
                    onClick={() => setShowAddAddressForm(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary & Payment */}
        <div className="w-full md:w-96 bg-white p-6 rounded shadow flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          {/* Products in cart */}
          <div className="space-y-4 mb-4 max-h-72 overflow-y-auto">
            {products.length === 0 && (
              <p className="text-center text-gray-500">No items in cart.</p>
            )}
            {products.map(({ id, name, price, quantity, image }) => (
              <div
                key={id}
                className="flex items-center space-x-4 border-b pb-3"
              >
                <img
                  src={image}
                  alt={name}
                  className="w-16 h-16 object-contain rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{name}</h3>
                  <p className="text-gray-600">
                    ₹{price} x {quantity} = ₹{price * quantity}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <button
                      onClick={() => decreaseQty(id)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                      aria-label={`Decrease quantity of ${name}`}
                    >
                      −
                    </button>
                    <span>{quantity}</span>
                    <button
                      onClick={() => increaseQty(id)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                      aria-label={`Increase quantity of ${name}`}
                    >
                      +
                    </button>
                  </div>
                  <div className="mt-2 flex space-x-4 text-sm text-blue-600 cursor-pointer">
                    <button onClick={() => removeProduct(id)}>Remove</button>
                    <button onClick={() => saveForLater(id)}>
                      Save for later
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Saved for Later */}
          {savedForLater.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3 text-blue-700">
                Saved for Later
              </h3>
              <div className="space-y-4 max-h-48 overflow-y-auto">
                {savedForLater.map(({ id, name, price, image }) => (
                  <div
                    key={id}
                    className="flex items-center space-x-4 border-b pb-3"
                  >
                    <img
                      src={image}
                      alt={name}
                      className="w-16 h-16 object-contain rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{name}</h4>
                      <p className="text-gray-600">₹{price}</p>
                      <button
                        onClick={() => moveToCart(id)}
                        className="text-blue-600 hover:underline text-sm mt-1"
                      >
                        Move to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price summary */}
          <div className="mb-4 mt-6">
            <p className="flex justify-between">
              <span>Price ({itemsCount} items)</span>
              <span>₹{price}</span>
            </p>
            <p className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </p>
            <p className="flex justify-between">
              <span>Delivery Charges</span>
              <span>
                {deliveryCharges === 0 ? "Free" : `₹${deliveryCharges}`}
              </span>
            </p>
            <hr className="my-2" />
            <p className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </p>
          </div>

          {/* Payment Options */}
          <h2 className="text-xl font-semibold mb-4">Payment Options</h2>

          <div className="flex flex-col space-y-3 mb-6">
            {["cod", "card", "upi", "netbanking"].map((method) => (
              <div key={method} className="border rounded p-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="form-radio text-blue-600"
                  />
                  <span className="capitalize font-medium">
                    {
                      {
                        cod: "Cash on Delivery",
                        card: "Credit/Debit Card",
                        upi: "UPI",
                        netbanking: "Net Banking",
                      }[method]
                    }
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePaymentDetails(method)}
                    className="ml-auto text-blue-600 hover:underline text-sm"
                  >
                    {paymentDetailsVisible[method]
                      ? "Hide Details"
                      : "View Details"}
                  </button>
                </label>
                {paymentDetailsVisible[method] && (
                  <div className="mt-2 text-sm text-gray-600">
                    {
                      {
                        cod: "Pay with cash upon delivery at your doorstep.",
                        card:
                          "Enter your credit or debit card details securely during the next step.",
                        upi:
                          "Pay instantly using UPI apps like Google Pay, PhonePe, Paytm.",
                        netbanking:
                          "Make payment using your bank's net banking portal.",
                      }[method]
                    }
                  </div>
                )}

                {/* Show Card form only if card method and details visible */}
                {method === "card" &&
                  paymentMethod === "card" &&
                  paymentDetailsVisible.card && (
                    <div className="mt-4 space-y-3">
                      <input
                        type="text"
                        placeholder="Name on Card"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Card Number (xxxx xxxx xxxx xxxx)"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                        className="w-full border rounded px-3 py-2"
                      />
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          placeholder="Expiry (MM/YY)"
                          maxLength={5}
                          value={expiry}
                          onChange={(e) =>
                            setExpiry(formatExpiry(e.target.value))
                          }
                          className="w-1/2 border rounded px-3 py-2"
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          maxLength={4}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                          className="w-1/2 border rounded px-3 py-2"
                        />
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>

          <button
            onClick={handlePlaceOrder}
            className="bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
