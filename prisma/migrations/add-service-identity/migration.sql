-- AddServiceIdentityFields
ALTER TABLE Service ADD COLUMN url VARCHAR(255);
ALTER TABLE Service ADD COLUMN iconKey VARCHAR(50);
