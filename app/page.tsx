"use client"

import React, { useEffect, useState } from 'react';

export default function UserForm() {

  const emptyForm = { name: '', email: '', password: '', dob: '' };

  const [formData, setFormData] = useState<any>(emptyForm);
  const [users, setUsers] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<any>({});

  // ✅ Load users
  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (data.success) setUsers(data.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email required';
    if (formData.password.length < 6) newErrors.password = 'Password min 6 chars';
    if (!formData.dob) newErrors.dob = 'DOB required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const url = editId ? `/api/users?id=${editId}` : "/api/users";
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.message });
        return;
      }

      setSuccessMessage(editId ? "User updated!" : "User added!");
      setFormData(emptyForm);
      setEditId(null);
      fetchUsers();

    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: any) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      dob: user.dob?.substring(0, 10)
    });
    setEditId(user._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;

    await fetch(`/api/users?id=${id}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-10">

      {/* FORM */}
      <form onSubmit={handleSubmit} className="p-6 border rounded space-y-4">

        <h2 className="text-xl font-bold">
          {editId ? "Edit User" : "Add User"}
        </h2>

        {successMessage && <div className="text-green-600">{successMessage}</div>}
        {errors.general && <div className="text-red-600">{errors.general}</div>}

        <input name="name" placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 w-full" />

        <input name="email" placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 w-full" />

        <input type="password" name="password" placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="border p-2 w-full" />

        <input type="date" name="dob"
          value={formData.dob}
          onChange={handleChange}
          className="border p-2 w-full" />

        <button disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? "Update" : "Submit"}
        </button>
      </form>


      {/* USER LIST */}
      <div className="border p-6 rounded">
        <h2 className="text-xl font-bold mb-4">Users</h2>

        {users.map((user) => (
          <div key={user._id}
            className="flex justify-between border-b py-2">

            <div>
              <div><strong>{user.name}</strong></div>
              <div>{user.email}</div>
            </div>

            <div className="space-x-2">
              <button
                onClick={() => handleEdit(user)}
                className="bg-yellow-500 text-white px-2 py-1 rounded">
                Edit
              </button>

              <button
                onClick={() => handleDelete(user._id)}
                className="bg-red-600 text-white px-2 py-1 rounded">
                Delete
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
