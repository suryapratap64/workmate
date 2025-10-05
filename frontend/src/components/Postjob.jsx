import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import {
  Loader2,
  Image as ImageIcon,
  MapPin,
  BadgeCheck,
  DollarSign,
  FileText,
} from "lucide-react";

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prize: "",
    location: "",
    verified: false,
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages(selectedFiles);

    const imagePreviews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviews(imagePreviews);
  };

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const removeImage = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    const newPreviews = previews.filter((_, i) => i !== idx);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submission = new FormData();
    for (let key in formData) {
      submission.append(key, formData[key]);
    }
    images.forEach((image) => {
      submission.append("images", image);
    });

    try {
      await axios.post(`${API_URL}/api/v1/job/postjob`, submission, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // Include cookies for authentication
      });
      alert("Job posted successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        prize: "",
        location: "",
        verified: false,
      });
      setImages([]);
      setPreviews([]);

      // Redirect to home page
      navigate("/home");
    } catch (err) {
      console.error("Error posting job:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to post job. Please make sure you are logged in.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-900">Post a New Job</h2>

        {/* Title */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter job title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the job requirements and details"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            rows={4}
            required
          />
        </div>

        {/* Prize & Location */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (₹)
            </label>
            <input
              name="prize"
              value={formData.prize}
              onChange={handleChange}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              type="number"
              min="0"
            />
          </div>
          <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Verified */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="verified"
              checked={formData.verified}
              onChange={handleChange}
              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mark as verified job</span>
          </label>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Images (optional)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="w-full cursor-pointer">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload images</p>
                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </label>
          </div>
          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {previews.map((src, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={src}
                    alt={`preview-${idx}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm"
                  >
                    <span className="text-gray-500 text-xs">✕</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Posting...</span>
            </div>
          ) : (
            "Post Job"
          )}
        </button>
      </form>
    </div>
  );
};

export default PostJob;
