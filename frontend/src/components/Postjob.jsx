import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100"
        style={{ backdropFilter: "blur(2px)" }}
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">
          🚀 Post a New Job
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Describe your job and attract the best talent!
        </p>

        {/* Title */}
        <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-3 py-2">
          <FileText className="text-blue-400" />
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Job Title"
            className="w-full bg-transparent outline-none text-lg"
            required
          />
        </div>

        {/* Description */}
        <div className="flex items-start gap-3 bg-blue-50 rounded-lg px-3 py-2">
          <BadgeCheck className="mt-1 text-blue-400" />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Job Description"
            className="w-full bg-transparent outline-none text-lg resize-none"
            rows={3}
            required
          />
        </div>

        {/* Prize & Location */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 w-1/2">
            <DollarSign className="text-green-400" />
            <input
              name="prize"
              value={formData.prize}
              onChange={handleChange}
              placeholder="Prize (e.g. 5000)"
              className="w-full bg-transparent outline-none text-lg"
              required
              type="number"
              min="0"
            />
          </div>
          <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 w-1/2">
            <MapPin className="text-green-400" />
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location (e.g. Prayagraj)"
              className="w-full bg-transparent outline-none text-lg"
              required
            />
          </div>
        </div>

        {/* Verified */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="verified"
            checked={formData.verified}
            onChange={handleChange}
            className="accent-green-500"
          />
          <span className="text-green-700 font-medium">Verified Job</span>
        </label>

        {/* Image Upload */}
        <div className="bg-purple-50 rounded-lg px-3 py-4">
          <label className="flex items-center gap-2 mb-2 font-medium text-purple-700 cursor-pointer">
            <ImageIcon className="text-purple-400" />
            <span>Upload Images (optional)</span>
            <input
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {previews.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={src}
                    alt={`preview-${idx}`}
                    className="h-20 w-20 object-cover rounded-lg border-2 border-purple-200 shadow"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform duration-200"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Posting...
            </>
          ) : (
            <>Post Job</>
          )}
        </button>
      </form>
    </div>
  );
};

export default PostJob;
