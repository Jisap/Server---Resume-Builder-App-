import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
  return token
}


// POST : /api/users/register
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    const token = generateToken(user._id);
    user.password = undefined;  // Ocultar contraseña

    res.status(201).json({
      message: "User created successfully",
      user,
      token,
    })

  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// POST: /api/users/login
export const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const isMatch = user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const token = generatedToken(user._id)
    user.password = undefined;

    res.status(200).json({
      message: "User logged in successfully",
      user,
      token,

    })

  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// GET: /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const id = req.userId
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.password = undefined;

    res.status(200).json({
      message: "Login succesfull",
      token,
      user
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

