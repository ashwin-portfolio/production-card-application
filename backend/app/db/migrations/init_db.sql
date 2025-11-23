-- Initial database setup script for MySQL
CREATE DATABASE IF NOT EXISTS production_card_db;
USE production_card_db;

-- Sample data insertion (run after tables are created by SQLAlchemy)

-- Insert sample sites
INSERT INTO sites (site_name, latitude, longitude) VALUES
('Factory Site 1', 13.0827, 80.2707),
('Factory Site 2', 12.9716, 77.5946);

-- Insert admin user (password: admin123)
INSERT INTO users (name, phone, password_hash, role, site_id, language) VALUES
('Admin User', '+919876543210', '$2b$12$6DIbX.tgTut.Oe3ZY7FHTe4PnHSrZxbCk/5yh6OfNUn/Wsuz3UAom', 'admin', NULL, 'en');

-- Insert sample employees (password: employee123)
INSERT INTO users (name, phone, password_hash, role, site_id, language) VALUES
('Ravi Kumar', '+919876543211', '$2b$12$Z9axBNjWA.JnKRWLPa.Xk.vanNmnFYSEJusC5DwxyIkIDbWXWFREW', 'employee', 1, 'ta'),
('Priya Sharma', '+919876543212', '$2b$12$Z9axBNjWA.JnKRWLPa.Xk.vanNmnFYSEJusC5DwxyIkIDbWXWFREW', 'employee', 1, 'hi'),
('Arun Patel', '+919876543213', '$2b$12$Z9axBNjWA.JnKRWLPa.Xk.vanNmnFYSEJusC5DwxyIkIDbWXWFREW', 'employee', 2, 'en');

-- Insert sample production cards
INSERT INTO production_cards (card_number, site_id, assigned_to, data, status) VALUES
('CARD-001', 1, 2, '{"item": "Widget A", "quantity": 100}', 'assigned'),
('CARD-002', 1, 2, '{"item": "Widget B", "quantity": 50}', 'assigned'),
('CARD-003', 1, 3, '{"item": "Widget C", "quantity": 75}', 'assigned'),
('CARD-004', 2, 4, '{"item": "Gadget X", "quantity": 200}', 'assigned');




