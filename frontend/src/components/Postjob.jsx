import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    location: '',
    verified: false,
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages(selectedFiles);

    const imagePreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(imagePreviews);
  };

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submission = new FormData();
    for (let key in formData) {
      submission.append(key, formData[key]);
    }

    images.forEach((image) => {
      submission.append("images", image); // Upload images as part of FormData
    });

    try {
      await axios.post("http://localhost:8000/api/v1/job/postjob", submission, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Job posted successfully!');

      // Reset form after submission
      setFormData({
        title: '',
        description: '',
        prize: '',
        location: '',
        verified: false,
      });
      setImages([]);
      setPreviews([]);
    } catch (err) {
      console.error(err);
      alert('Failed to post job');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-600 text-white w-full mx-auto rounded">
      <h2 className="text-2xl mb-4">Post a Job</h2>

      <input name="title" onChange={handleChange} placeholder="Job Title" className="w-full p-2 mb-3 text-black" required />
      <textarea name="description" onChange={handleChange} placeholder="Job Description" className="w-full p-2 mb-3 text-black" required />
      <input name="prize" onChange={handleChange} placeholder="Prize (e.g. 50 rupees)" className="w-full p-2 mb-3 text-black" required />
      <input name="location" onChange={handleChange} placeholder="Location (e.g. Prayagraj)" className="w-full p-2 mb-3 text-black" required />

      <label className="flex items-center mb-3">
        <input type="checkbox" name="verified" onChange={handleChange} className="mr-2" />
        Verified
      </label>

      <input type="file" name="images" multiple accept="image/*" onChange={handleImageChange} className="mb-4" />
      {previews.length > 0 && (
        <div className="grid grid-cols-8 gap-2 mb-4">
          {previews.map((src, idx) => (
            <img key={idx} src={src} alt={`preview-${idx}`} className="h-32 object-cover rounded" />
          ))}
        </div>
      )}

      <button type="submit" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">
        Submit Job
      </button>
    </form>
  );
};

export default PostJob;
