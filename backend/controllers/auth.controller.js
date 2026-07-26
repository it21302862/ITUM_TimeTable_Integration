import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Instructor } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

function normalizePhone(phone) {
  if (!phone) return "";
  return String(phone).replace(/[\s\-().]/g, "");
}

function normalizeEmail(email) {
  if (!email) return "";
  return String(email).trim().toLowerCase();
}

async function findInstructorByEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const instructor = await Instructor.findOne({ where: { email: normalized } });
  if (instructor) return instructor;

  const all = await Instructor.findAll();
  return all.find((i) => normalizeEmail(i.email) === normalized) || null;
}

async function findInstructorByPhone(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  const instructor = await Instructor.findOne({ where: { phone } });
  if (instructor) return instructor;

  const all = await Instructor.findAll({ attributes: ["id", "phone"] });
  const matchId = all.find((i) => normalizePhone(i.phone) === normalized)?.id;
  if (!matchId) return null;

  return Instructor.findByPk(matchId);
}

function isSmsConfigured() {
  return (
    process.env.SMS_PROVIDER === "twilio" &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM
  );
}

async function sendResetSms(phone, code) {
  if (!isSmsConfigured()) return false;

  try {
    const twilio = await import("twilio");
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    const msg = await client.messages.create({
      body: `Your UniPlan reset code is: ${code}. Valid for 15 minutes.`,
      from: process.env.TWILIO_FROM,
      to: phone,
    });

    // Log useful Twilio response details for debugging
    try {
      console.log(`[Twilio] Message queued/sent. sid=${msg?.sid} status=${msg?.status} to=${phone}`);
    } catch (logErr) {
      console.log(`[Twilio] Message response (partial):`, msg);
    }

    return true;
  } catch (err) {
    // Log full error for easier debugging (includes Twilio error code/message/stack)
    console.error("Failed to send SMS via Twilio:", err && err.stack ? err.stack : err);
    try {
      // Twilio error objects may include more details
      if (err && err.code) console.error("Twilio error code:", err.code);
      if (err && err.moreInfo) console.error("Twilio moreInfo:", err.moreInfo);
    } catch (ignore) {}
    return false;
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Normalize input and find instructor in database
    const normalizedEmail = normalizeEmail(email);
    const instructor = await findInstructorByEmail(normalizedEmail);

    if (!instructor) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password with hashed password in database
    const passwordMatch = await bcrypt.compare(password, instructor.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: instructor.id, 
        email: instructor.email, 
        name: instructor.name,
        role: instructor.role
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: instructor.id,
        email: instructor.email,
        name: instructor.name,
        role: instructor.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const logout = async (req, res) => {
  try {
    // Token invalidation would typically be handled by:
    // 1. Blacklisting on the server
    // 2. Client-side token removal (which is already done in LoginPage)
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};

// Get current user profile
export const getUserProfile = async (req, res) => {
  try {
    const instructorId = req.user.id;
    
    const instructor = await Instructor.findByPk(instructorId);
    
    if (!instructor) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: instructor.id,
      name: instructor.name,
      email: instructor.email,
      department: instructor.department,
      address: instructor.address,
      role: instructor.role,
      imageUrl: instructor.imageUrl,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { name, email, department, address, phone, showEmail, showPhone, shareSchedule } = req.body;
    
    const instructor = await Instructor.findByPk(instructorId);
    
    if (!instructor) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields
    if (name) instructor.name = name;
    if (email) instructor.email = email;
    if (department) instructor.department = department;
    if (address) instructor.address = address;
    if (phone) instructor.phone = phone;
    if (typeof showEmail !== 'undefined') instructor.showEmail = showEmail === 'true' || showEmail === true;
    if (typeof showPhone !== 'undefined') instructor.showPhone = showPhone === 'true' || showPhone === true;
    if (typeof shareSchedule !== 'undefined') instructor.shareSchedule = shareSchedule === 'true' || shareSchedule === true;
    
    // Handle image upload if provided
    if (req.file) {
      // Store the file path or URL
      instructor.imageUrl = `/uploads/${req.file.filename}`;
    }

    await instructor.save();

    res.json({
      id: instructor.id,
      name: instructor.name,
      email: instructor.email,
      department: instructor.department,
      address: instructor.address,
      role: instructor.role,
      imageUrl: instructor.imageUrl,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Request a password reset code (SMS)
export const requestPasswordReset = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) return res.status(400).json({ error: "Phone number is required" });

    const instructor = await findInstructorByPhone(phone);

    if (!instructor) {
      return res.status(404).json({
        error: "No account found for this phone number. Ask an admin to add your phone to your instructor profile.",
      });
    }

    if (!instructor.phone) {
      return res.status(400).json({
        error: "This account has no phone number saved. Contact an admin to add one.",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    instructor.resetCode = code;
    instructor.resetExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await instructor.save();

    const smsSent = await sendResetSms(instructor.phone, code);

    if (!smsSent) {
      console.log(`[Password Reset] Code for ${instructor.phone}: ${code}`);
    }

    const response = {
      message: smsSent
        ? "Reset code sent to your phone."
        : "SMS is not configured on the server. See the code below for development testing.",
      smsSent,
    };

    if (!smsSent && process.env.NODE_ENV !== "production") {
      response.devCode = code;
      response.devHint =
        "Twilio SMS is not set up. Use this code to reset your password, or check the backend terminal.";
    }

    res.json(response);
  } catch (error) {
    console.error("Request password reset error:", error);
    res.status(500).json({ error: "Failed to request password reset" });
  }
};

// Reset password using phone + code
export const resetPassword = async (req, res) => {
  try {
    const { phone, code, newPassword } = req.body;

    if (!phone || !code || !newPassword) {
      return res.status(400).json({ error: "phone, code and newPassword are required" });
    }

    const instructor = await findInstructorByPhone(phone);
    if (!instructor) {
      return res.status(404).json({ error: "No account found for this phone number" });
    }

    if (!instructor.resetCode || instructor.resetCode !== code) {
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    if (!instructor.resetExpiry || new Date() > new Date(instructor.resetExpiry)) {
      return res.status(400).json({ error: "Reset code has expired" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    instructor.password = hashed;
    instructor.resetCode = null;
    instructor.resetExpiry = null;
    await instructor.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
