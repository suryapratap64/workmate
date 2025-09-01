import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { MessageCircle, ArrowLeft, Send } from "lucide-react";

const StartConversation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [client, setClient] = useState(null);

  const jobId = searchParams.get("jobId");
  const clientId = searchParams.get("clientId");

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/job/getjob/${jobId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setJob(response.data.job);
        setClient(response.data.job.client);
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      // Create conversation first
      const conversationResponse = await axios.post(
        "http://localhost:8000/api/v1/message/conversations",
        {
          jobId: jobId,
          clientId: clientId, // Pass the client ID when worker is starting conversation
        },
        {
          withCredentials: true,
        }
      );

      if (conversationResponse.data.success) {
        const conversation = conversationResponse.data.conversation;

        // Send the first message
        const messageResponse = await axios.post(
          "http://localhost:8000/api/v1/message/messages",
          {
            conversationId: conversation._id,
            content: message.trim(),
            messageType: "text",
          },
          {
            withCredentials: true,
          }
        );

        if (messageResponse.data.success) {
          // Navigate to the message page
          navigate("/message");
        } else {
          throw new Error(
            messageResponse.data.message || "Failed to send message"
          );
        }
      } else {
        throw new Error(
          conversationResponse.data.message || "Failed to create conversation"
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send message. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!job || !client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Start Conversation
              </h1>
              <p className="text-sm text-gray-500">
                Send a message to {client.firstName} {client.lastName}
              </p>
            </div>
          </div>

          {/* Job Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{job.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{job.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600 font-medium">₹{job.prize}</span>
              <span className="text-gray-500">{job.location}</span>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || loading}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartConversation;
