import { useState } from "react";

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    message: ""
  });

  const [errors, setErrors] = useState({});

  // Replace with your actual location coordinates
  const defaultLocation = {
    lat: 40.7128, // New York City coordinates
    lng: -74.0060
  };

  const onchange = (e) => {
    const { name, value } = e.target;

    // For phone input, allow only digits
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, ""); // remove non-digits
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // true if no errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form submitted:", formData);
      // send data to backend or reset form
      setFormData({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        message: ""
      });
      setErrors({});
    } else {
      console.log("Validation errors:", errors);
    }
  };

  return (
    <div className="m-5 lg:m-0 min-h-[90vh] flex justify-center items-center">
      <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Contact Form - Left Side */}
          <div className="w-full lg:w-1/2 p-8 lg:p-10">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2 text-gray-800">Get in Touch</h1>
              <p className="text-lg text-gray-500">We like to hear from you</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">FIRST NAME</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="Enter first name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    onChange={onchange}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LAST NAME</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    placeholder="Enter last name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    onChange={onchange}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">EMAIL</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter your email..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    onChange={onchange}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PHONE</label>
                  <input
                    type="text"
                    name="phone"
                    maxLength={10}
                    value={formData.phone}
                    placeholder="Enter phone number..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    onChange={onchange}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MESSAGE</label>
                <textarea
                  name="message"
                  value={formData.message}
                  rows={4}
                  placeholder="Enter your message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
                  onChange={onchange}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="cursor-pointer w-1/3 px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition transform hover:-translate-y-1 duration-300 ease-in-out"
                >
                  SUBMIT
                </button>
              </div>
            </form>
          </div>
 
          {/* Google Map - Right Side */}
          <div className="w-full lg:w-1/2 border-l-1 border-gray-200">
            <div className="h-full w-full">
              <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3913.0233550693792!2d75.78530727536592!3d11.259692088920032!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba6593721da38bb%3A0xe896298d6b7cf1d9!2sInfocampus!5e0!3m2!1sen!2sin!4v1761626247534!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;