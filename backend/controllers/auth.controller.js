import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Instructor } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find instructor in database
    const instructor = await Instructor.findOne({ where: { email } });

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
    const { name, email, department, address } = req.body;
    
    const instructor = await Instructor.findByPk(instructorId);
    
    if (!instructor) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields
    if (name) instructor.name = name;
    if (email) instructor.email = email;
    if (department) instructor.department = department;
    if (address) instructor.address = address;
    
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
