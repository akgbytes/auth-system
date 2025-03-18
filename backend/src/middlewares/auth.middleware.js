import jwt from "jsonwebtoken";

export const isLoggedIn = async (req, res, next) => {
  try {
    console.log(req.cookies);
    let accessToken = req.cookies?.accessToken;

    console.log("Token Found", token ? "Yes" : "No");

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Request",
      });
    }
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    console.log("Decoded Token: ", decodedToken);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.log("Auth middleware error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server down",
    });
  }
};
