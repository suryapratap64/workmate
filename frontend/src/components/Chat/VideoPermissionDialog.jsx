import React from "react";
import { Shield, Camera, Mic, X } from "lucide-react";

const VideoPermissionDialog = ({ onRequestPermissions, onCancel, error }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">
              Camera & Microphone Access
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            This app needs access to your camera and microphone for video calls.
          </p>

          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              <span>Camera</span>
            </div>
            <div className="flex items-center">
              <Mic className="h-5 w-5 mr-2" />
              <span>Microphone</span>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error.name === "NotAllowedError"
                ? "Permission denied. Please allow access to your camera and microphone in your browser settings."
                : "Error accessing media devices. Please make sure your camera and microphone are properly connected."}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onRequestPermissions}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Allow Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPermissionDialog;
