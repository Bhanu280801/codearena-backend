const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const RESET_TOKEN_EXPIRES_IN = "15m";
const RESET_TOKEN_PURPOSE = "password_reset";

const signAuthToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const getFrontendUrl = () => {
  const firstClientUrl = String(process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)[0];

  return firstClientUrl || "http://localhost:5173";
};

const signPasswordResetToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user.id,
      purpose: RESET_TOKEN_PURPOSE,
      passwordVersion: user.password
    },
    process.env.JWT_SECRET,
    { expiresIn: RESET_TOKEN_EXPIRES_IN }
  );
};

const signup = async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";

      return res.status(400).json({
        message: `${field} already exists`
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    const token = signAuthToken(user);

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: safeUser
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(" or ")
        : "User";

      return res.status(400).json({
        message: `${target} already exists`
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = signAuthToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message
    });
  }
};

const forgotPassword = async (req, res) => {
  // Password reset requires an email provider which is not yet configured.
  // In production this returns 501 so users are not silently dropped.
  if (process.env.NODE_ENV === "production") {
    return res.status(501).json({
      message: "Password reset via email is not yet available. Please contact support."
    });
  }

  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const genericMessage = "If that email exists, password reset instructions have been sent.";
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(200).json({
        message: genericMessage
      });
    }

    const resetToken = signPasswordResetToken(user);
    const resetUrl = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(resetToken)}`;

    // Development only — return the token directly for testing
    return res.status(200).json({
      message: genericMessage,
      resetToken,
      resetUrl
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = String(req.body.token || "");
    const password = String(req.body.password || "");

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({
        message: "Password reset link is invalid or expired"
      });
    }

    if (payload.purpose !== RESET_TOKEN_PURPOSE || !payload.id || !payload.passwordVersion) {
      return res.status(400).json({
        message: "Password reset link is invalid or expired"
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.id) }
    });

    if (!user || user.password !== payload.passwordVersion) {
      return res.status(400).json({
        message: "Password reset link is invalid or expired"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return res.status(200).json({
      message: "Password has been reset successfully"
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      message: error.message
    });
  }
};

const getProfile = async (req, res) => {
  
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = { signup, login, forgotPassword, resetPassword, getProfile };
