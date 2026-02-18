"use client"

import React, { useState } from 'react';

// import { submitForm } from '../services/api';

export default function UserForm() {

  const [formData, setFormData] = useState<any>(
    {
      name: '',
      email: '',
      password: '',
      dob: ''
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: any) => {
    setFormData(
      { // OBJECT STARTS
        ...formData,
        [e.target.name]: e.target.value
      } // OBJECT ENDS
    );
  };

  const validateForm = () => {
    let newErrors: any = {};
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be 6 characters';
    }
    // DOB validation
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }
    console.log("validation errors", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // from here we connect to the backend api to submit the form data.
  const submitForm = async (formData: any): Promise<any> => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      console.log(res);

      if (!res.ok) {
        const errorData = await res.json();
        console.log("errorData", errorData);
        return { success: false, message: errorData.message + " Technical details: " + errorData.error  || "Failed to add user" };
      }

      const newUser = await res.json();

      setFormData({ name: '', email: '', password: '', dob: '' });
      return { success: true, message: "User added successfully!" };

    } catch (error: any) {
      console.error("Add error:", error)
      return { success: false, message: "User could not be added successfully, error: " + error.message + " Technical details: " + error.error };
      // throw error;
    }
  }


  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // Client-side validation
    const valid = validateForm();
    if (!valid) return; // return from here because of validation errors.

    // here there is no error
    setSuccessMessage("Processing ...");
    setIsSubmitting(true);
    setErrors({});

    try {
      // Call API
      const result = await submitForm(formData);

      if (!result.success) {
        setErrors({ general: result.message });
        setSuccessMessage("");
        return;
      }
      
      // Success
      setErrors({});
      setSuccessMessage(result.message);
      setFormData({ name: '', email: '', password: '', dob: '' });

    } catch (error: any) {
      // Handle API errors (including backend validation
      if (typeof error === 'object') {
        setErrors(error); // Backend validation errors
      } else {
        setErrors({ general: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto mt-10 p-6 rounded shadow">
      <div className="space-y-4 p-4 border border-gray-300 rounded">

        <h3 className="text-2xl font-bold">User form</h3>

        <div className="text-green-600 font-bold">{successMessage}</div>
        {errors.general && <div className="text-red-700">{errors.general}</div>}

        <div>
          <label>Name:</label>
          <input type="text" name="name"
            value={formData.name}
            onChange={handleChange} />
          {errors.name && <div className="text-red-700">{errors.name}</div>}
        </div>

        <div>
          <label>Email:</label>
          <input type="email" name="email"
            value={formData.email}
            onChange={handleChange} />
          {errors.email && <div className="text-red-700">{errors.email}</div>}
        </div>

        <div>
          <label>password:</label>
          <input type="password" name="password"
            value={formData.password}
            onChange={handleChange} />
          {errors.password && <div className="text-red-700">{errors.password}</div>}
        </div>

        <div>
          <label>dob:</label>
          <input type="date" name="dob"
            value={formData.dob}
            onChange={handleChange} />
          {errors.dob && <div className="text-red-700">{errors.dob}</div>}
        </div>


        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400">
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>

      </div>



    </form>
  );
}
