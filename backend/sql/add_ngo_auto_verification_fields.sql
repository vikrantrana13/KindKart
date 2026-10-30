ALTER TABLE users
ADD COLUMN ngo_verification_method VARCHAR(30) NULL,
ADD COLUMN ngo_verification_document LONGTEXT NULL;

UPDATE users
SET
  ngo_verification_status = 'approved',
  ngo_verification_method = CASE
    WHEN ngo_verification_document IS NOT NULL AND ngo_verification_document <> '' THEN 'document'
    ELSE 'contact'
  END,
  reviewed_at = NULL
WHERE role = 'ngo';
