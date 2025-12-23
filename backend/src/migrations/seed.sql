-- Seed a demo user with password 'password'
INSERT INTO users (name, email, password_hash)
VALUES ('Demo User', 'demo@example.com', '$2b$10$zV2Y7GmQ7YzG2uLQbq2cXufE0JrY4wQFzKkJr1VqY2J4hQ77sQm.a')
ON CONFLICT (email) DO NOTHING;

-- Create an account for demo user
DO $$
DECLARE uid INTEGER;
BEGIN
  SELECT id INTO uid FROM users WHERE email='demo@example.com';
  IF uid IS NOT NULL THEN
    INSERT INTO accounts (user_id, name, balance) VALUES (uid, 'Main', 1000.00) ON CONFLICT DO NOTHING;
  END IF;
END$$;

-- Add some transactions
INSERT INTO transactions (account_id, type, amount)
SELECT a.id, 'deposit', 1000.00 FROM accounts a JOIN users u ON a.user_id=u.id WHERE u.email='demo@example.com'
ON CONFLICT DO NOTHING;
