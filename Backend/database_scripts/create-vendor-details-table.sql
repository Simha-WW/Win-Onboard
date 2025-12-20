-- Create vendor_details table
CREATE TABLE IF NOT EXISTS vendor_details (
    vendor_id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    contact_number VARCHAR(20),
    company_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial vendor
INSERT INTO vendor_details (vendor_name, email, company_name, status) 
VALUES ('Test Vendor', 'vijayasimhatest@gmail.com', 'Document Verification Services', 'active');

-- Display the inserted record
SELECT * FROM vendor_details;
