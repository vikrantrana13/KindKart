ALTER TABLE users
ADD COLUMN ngo_verification_status VARCHAR(20) NULL,
ADD COLUMN reviewed_at DATETIME NULL;

UPDATE users
SET ngo_verification_status = 'pending'
WHERE role = 'ngo' AND (ngo_verification_status IS NULL OR ngo_verification_status = '');
