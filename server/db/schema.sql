CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  balance NUMERIC(12,2) DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_name VARCHAR(100) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  returns_percent NUMERIC(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reference VARCHAR(100) UNIQUE,
  type VARCHAR(20) NOT NULL, -- deposit, withdrawal
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, success, failed
  created_at TIMESTAMP DEFAULT NOW()
);


ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL, -- 'user' or 'admin'
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS available_at TIMESTAMP;

ALTER TABLE transactions ADD CONSTRAINT transactions_reference_unique UNIQUE (reference);