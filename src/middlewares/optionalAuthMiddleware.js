const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await prisma.user.findUnique({
      where: {
        id: decoded.id
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    return next();
  } catch (error) {
    return next();
  }
};

module.exports = optionalAuthMiddleware;
