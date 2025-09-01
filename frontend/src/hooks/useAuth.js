import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/workerSlice";
import axios from "axios";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.worker);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Only fetch if we have a user but no profile picture
        if (user && !user.profilePicture) {
          const response = await axios.get(
            "http://localhost:8000/api/v1/user/profile",
            {
              withCredentials: true,
            }
          );

          if (response.data.success) {
            dispatch(setUser(response.data.user));
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [user, dispatch]);

  return { user };
};
