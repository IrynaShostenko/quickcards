const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../db/pool");

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
}

function mapUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };
}

async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await pool.query(
    `
    SELECT id
    FROM users
    WHERE email = $1
    `,
    [normalizedEmail],
  );

  if (existingUser.rows[0]) {
    const error = new Error("User with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at
    `,
    [name.trim(), normalizedEmail, passwordHash],
  );

  const user = result.rows[0];
  const token = createToken(user);

  return {
    user: mapUser(user),
    token,
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `
    SELECT id, name, email, password_hash, created_at
    FROM users
    WHERE email = $1
    `,
    [normalizedEmail],
  );

  const user = result.rows[0];

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const token = createToken(user);

  return {
    user: mapUser(user),
    token,
  };
}

async function getUserById(userId) {
  const result = await pool.query(
    `
    SELECT id, name, email, created_at
    FROM users
    WHERE id = $1
    `,
    [userId],
  );

  const user = result.rows[0];

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return mapUser(user);
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};
