-- LAM Teknik - Test Users Setup

-- Insert/Update test users with proper credentials
-- All passwords are hashed version of "password123" using bcrypt with 10 rounds

INSERT INTO users (id, name, email, password, role, tenantId, isActive) VALUES
(1, 'Admin LAM Teknik', 'admin@lamtek.ac.id', '$2b$10$dGQpyMuHJt5b9.FD8HbG5OFYK/VD5D8.K7lH3w9Eqa0yP8K4vVNkS', 'ADMIN', NULL, 1),
(2, 'Demo User', 'demo@test.com', '$2b$10$GUVUT4FgN7upvWS2aTQwwO2tGHQHUfvV8dj9N9YVxC8bq.0x3eUme', 'PRODI', NULL, 1),
(3, 'Validator User', 'validator@test.com', '$2b$10$GUVUT4FgN7upvWS2aTQwwO2tGHQHUfvV8dj9N9YVxC8bq.0x3eUme', 'VALIDATOR', NULL, 1),
(4, 'Institution User', 'institution@test.com', '$2b$10$GUVUT4FgN7upvWS2aTQwwO2tGHQHUfvV8dj9N9YVxC8bq.0x3eUme', 'KOMITE_EVALUASI', NULL, 1)
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  password = VALUES(password),
  role = VALUES(role),
  isActive = VALUES(isActive);

-- Verify the users were created
SELECT id, name, email, role, isActive FROM users ORDER BY id;
