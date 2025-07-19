-- Additional sample change requests with various completion statuses

-- Completed Change Request 1 (All applications completed)
INSERT INTO change_requests (change_id, title, description, change_type, status, start_date_time, end_date_time, change_manager_id) VALUES
('CR-2025-001246', 'Security Certificate Renewal', 'Annual SSL certificate renewal across all applications', 'P1', 'completed', '2025-01-15 10:00:00', '2025-01-15 14:00:00', '45228804');

-- Get the ID for the completed change request
WITH cr_id AS (SELECT id FROM change_requests WHERE change_id = 'CR-2025-001246')
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comments, post_change_comments, pre_change_updated_at, post_change_updated_at) 
SELECT 
  cr_id.id, 
  app_id,
  'completed',
  'completed',
  pre_comment,
  post_comment,
  '2025-01-15 09:30:00',
  '2025-01-15 15:00:00'
FROM cr_id, (VALUES 
  (1, 'Certificate validation completed successfully.', 'New certificate installed and verified.'),
  (2, 'Payment system certificate updated.', 'All payment flows tested and working.'),
  (3, 'Inventory system certificate renewed.', 'Database connections verified with new certificate.'),
  (4, 'Email service certificate updated.', 'SMTP/IMAP services restarted successfully.')
) AS t(app_id, pre_comment, post_comment);

-- In Progress Change Request 1 (Mixed statuses)
INSERT INTO change_requests (change_id, title, description, change_type, status, start_date_time, end_date_time, change_manager_id) VALUES
('CR-2025-001247', 'Database Migration Phase 2', 'Migrating remaining legacy databases to new infrastructure', 'P1', 'active', '2025-01-20 08:00:00', '2025-01-20 20:00:00', '45228804');

-- Mixed status applications for in-progress request
WITH cr_id AS (SELECT id FROM change_requests WHERE change_id = 'CR-2025-001247')
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comments, post_change_comments, pre_change_updated_at, post_change_updated_at) 
SELECT 
  cr_id.id, 
  app_id,
  pre_status,
  post_status,
  pre_comment,
  post_comment,
  CASE WHEN pre_status = 'completed' THEN '2025-01-20 07:30:00'::timestamp ELSE NULL END,
  CASE WHEN post_status = 'completed' THEN '2025-01-20 16:00:00'::timestamp ELSE NULL END
FROM cr_id, (VALUES 
  (5, 'completed', 'in_progress', 'Pre-migration backup completed.', 'Currently migrating analytics data.'),
  (6, 'completed', 'pending', 'Mobile backend prepared for migration.', null),
  (7, 'in_progress', 'pending', 'Currently backing up notification data.', null),
  (8, 'completed', 'completed', 'File storage migration completed.', 'All files successfully migrated and verified.')
) AS t(app_id, pre_status, post_status, pre_comment, post_comment);

-- Pending Change Request 1 (All pending)
INSERT INTO change_requests (change_id, title, description, change_type, status, start_date_time, end_date_time, change_manager_id) VALUES
('CR-2025-001248', 'Network Infrastructure Upgrade', 'Upgrading network switches and routers', 'Standard', 'scheduled', '2025-01-25 02:00:00', '2025-01-25 06:00:00', '45228804');

-- All pending applications
WITH cr_id AS (SELECT id FROM change_requests WHERE change_id = 'CR-2025-001248')
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comments, post_change_comments) 
SELECT 
  cr_id.id, 
  app_id,
  'pending',
  'pending',
  null,
  null
FROM cr_id, (VALUES (1), (2), (9), (10)) AS t(app_id);

-- Completed Change Request 2 (Mixed completed and N/A)
INSERT INTO change_requests (change_id, title, description, change_type, status, start_date_time, end_date_time, change_manager_id) VALUES
('CR-2025-001249', 'Legacy System Decommission', 'Removing old reporting system dependencies', 'P2', 'completed', '2025-01-18 16:00:00', '2025-01-18 20:00:00', '45228804');

-- Mixed completed and not applicable
WITH cr_id AS (SELECT id FROM change_requests WHERE change_id = 'CR-2025-001249')
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comments, post_change_comments, pre_change_updated_at, post_change_updated_at) 
SELECT 
  cr_id.id, 
  app_id,
  pre_status,
  post_status,
  pre_comment,
  post_comment,
  CASE WHEN pre_status = 'completed' THEN '2025-01-18 15:30:00'::timestamp ELSE '2025-01-18 14:00:00'::timestamp END,
  CASE WHEN post_status = 'completed' THEN '2025-01-18 19:30:00'::timestamp ELSE '2025-01-18 14:00:00'::timestamp END
FROM cr_id, (VALUES 
  (3, 'completed', 'completed', 'Legacy connections removed from inventory system.', 'System verified working without legacy dependencies.'),
  (5, 'completed', 'completed', 'Analytics dashboard updated.', 'All reports now use new data sources.'),
  (7, 'not_applicable', 'not_applicable', 'Notification service does not use legacy reporting.', 'No changes required.'),
  (9, 'not_applicable', 'not_applicable', 'Audit service independent of legacy system.', 'No impact from decommission.')
) AS t(app_id, pre_status, post_status, pre_comment, post_comment);

-- In Progress Change Request 2 (Emergency with active work)
INSERT INTO change_requests (change_id, title, description, change_type, status, start_date_time, end_date_time, change_manager_id) VALUES
('CR-2025-001250', 'Critical Performance Fix', 'Emergency fix for database connection pool exhaustion', 'Emergency', 'active', '2025-01-21 14:00:00', '2025-01-21 18:00:00', '45228804');

-- Emergency with in-progress work
WITH cr_id AS (SELECT id FROM change_requests WHERE change_id = 'CR-2025-001250')
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comments, post_change_comments, pre_change_updated_at) 
SELECT 
  cr_id.id, 
  app_id,
  pre_status,
  'pending',
  pre_comment,
  null,
  CASE WHEN pre_status = 'completed' THEN '2025-01-21 13:45:00'::timestamp ELSE NULL END
FROM cr_id, (VALUES 
  (1, 'completed', 'Connection pool settings optimized for customer portal.'),
  (2, 'completed', 'Payment gateway connection limits increased.'),
  (3, 'in_progress', 'Currently applying connection pool fixes to inventory system.'),
  (6, 'in_progress', 'Mobile backend connection optimization in progress.')
) AS t(app_id, pre_status, pre_comment);