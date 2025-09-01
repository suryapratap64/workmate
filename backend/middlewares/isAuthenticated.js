import jwt from "jsonwebtoken";
const isAuthenticated = async (req, res, next) => {
  try {
    // Support token from cookie or Authorization header (Bearer <token>)
    let token = req.cookies?.token;
    if (!token && req.headers?.authorization) {
      const auth = req.headers.authorization;
      if (auth.startsWith("Bearer ")) {
        token = auth.split(" ")[1].trim();
      }
    }

    if (!token) {
      return res.status(402).json({
        message: "user is not authenticated",
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    req.user = {
      userId: decode.userId,
      userType: decode.userType || "worker", // Default to worker if not specified
    };
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: "Authentication failed",
      success: false,
    });
  }
};
export default isAuthenticated;
