import { useEffect, useState } from "react";

export const useMediaPermissions = () => {
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
    screen: false,
  });

  const [error, setError] = useState(null);

  const requestPermissions = async () => {
    // Helper: wrap getUserMedia with a timeout to avoid AbortError hanging
    const requestMediaWithTimeout = (constraints, ms = 20000) => {
      return new Promise((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            reject(new Error("getUserMedia timeout"));
          }
        }, ms);

        navigator.mediaDevices
          .getUserMedia(constraints)
          .then((stream) => {
            if (settled) {
              stream.getTracks().forEach((t) => t.stop());
              return;
            }
            settled = true;
            clearTimeout(timer);
            resolve(stream);
          })
          .catch((err) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            reject(err);
          });
      });
    };

    try {
      // First, enumerate devices to short-circuit when none available.
      let devices = [];
      try {
        devices = await navigator.mediaDevices.enumerateDevices();
      } catch (e) {
        console.warn("Could not enumerate devices before permission check:", e);
      }

      const hasCamera = devices.some((d) => d.kind === "videoinput");
      const hasMic = devices.some((d) => d.kind === "audioinput");

      if (!hasCamera && !hasMic) {
        // No media devices at all — update state and return
        const screenAvailable =
          navigator.mediaDevices.getDisplayMedia !== undefined;
        setPermissions({
          camera: false,
          microphone: false,
          screen: screenAvailable,
        });
        setError(new Error("No media devices found"));
        return null;
      }

      // Request camera and microphone permissions (with timeout)
      const stream = await requestMediaWithTimeout(
        { video: true, audio: true },
        20000
      );

      // Stop the tracks immediately after getting permissions
      stream.getTracks().forEach((track) => track.stop());

      // Check if screen sharing is available
      const screenAvailable =
        navigator.mediaDevices.getDisplayMedia !== undefined;

      setPermissions({
        camera: true,
        microphone: true,
        screen: screenAvailable,
      });
      setError(null);
      return { camera: true, microphone: true, screen: screenAvailable };
    } catch (err) {
      console.error("Error requesting permissions:", err);
      setError(err);

      // Fallback: try to determine which devices are available
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some((d) => d.kind === "videoinput");
        const hasMic = devices.some((d) => d.kind === "audioinput");

        setPermissions((prev) => ({
          ...prev,
          camera: false,
          microphone: hasMic,
        }));
      } catch (e) {
        console.warn("Could not enumerate devices:", e);
        setPermissions((prev) => ({
          ...prev,
          camera: false,
          microphone: false,
        }));
      }

      // Preserve the error for callers
      return null;
    }
  };

  // NOTE: We no longer auto-request permissions on mount because browsers
  // may block or time out permission prompts not triggered by direct user
  // interaction. Callers should explicitly call `requestPermissions()` when
  // a user clicks a button to start a call.

  return {
    permissions,
    error,
    requestPermissions,
  };
};
