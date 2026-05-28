const {
  getUserById,
  loginUser,
  registerUser,
} = require("../services/authService");

function validateRegisterBody({ name, email, password }) {
  if (!name || !email || !password) {
    const error = new Error("Name, email, and password are required.");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters.");
    error.statusCode = 400;
    throw error;
  }
}

function validateLoginBody({ email, password }) {
  if (!email || !password) {
    const error = new Error("Email and password are required.");
    error.statusCode = 400;
    throw error;
  }
}

async function register(req, res) {
  try {
    validateRegisterBody(req.body);

    const authData = await registerUser(req.body);

    return res.status(201).json(authData);
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Could not register user.",
    });
  }
}

async function login(req, res) {
  try {
    validateLoginBody(req.body);

    const authData = await loginUser(req.body);

    return res.json(authData);
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Could not login.",
    });
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = await getUserById(req.user.id);

    return res.json({ user });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Could not load current user.",
    });
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
};
