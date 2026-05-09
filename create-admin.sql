INSERT INTO "User" (id, email, "displayName", "passwordHash", role, "createdAt", "updatedAt") 
VALUES (
  'admin-001', 
  'admin@careflow.com', 
  'Admin User', 
  '$argon2id$v=19$m=65536,t=3,p=4$vAp2MPJWY/cMskhdful+mQ$QKirSKyAXLIBjsmqAUfoKXXVWAZEs96nPPO74eonFo4', 
  'ADMIN', 
  NOW(), 
  NOW()
)
ON CONFLICT (email) DO NOTHING;
