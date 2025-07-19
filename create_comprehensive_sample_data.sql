-- Comprehensive sample data for Change Request Management System

-- First, clear existing data to avoid conflicts
DELETE FROM change_request_applications;
DELETE FROM change_requests;
DELETE FROM applications;

-- Insert comprehensive applications with diverse SPOCs
INSERT INTO applications (name, spoc_id, created_at, updated_at) VALUES
  ('Customer Portal', '45228804', NOW(), NOW()),
  ('Payment Gateway', '45228804', NOW(), NOW()),
  ('Inventory Management System', '45228804', NOW(), NOW()),
  ('Email Service Platform', '45228804', NOW(), NOW()),
  ('Analytics Dashboard', '45228804', NOW(), NOW()),
  ('Mobile App Backend', '44316444', NOW(), NOW()),
  ('Notification Service', '44316444', NOW(), NOW()),
  ('File Storage System', '44316444', NOW(), NOW()),
  ('Audit Logging Service', '44316444', NOW(), NOW()),
  ('Third-party Integration Hub', '44316444', NOW(), NOW()),
  ('User Authentication Service', '45228804', NOW(), NOW()),
  ('Content Management System', '44316444', NOW(), NOW()),
  ('Database Management Portal', '45228804', NOW(), NOW()),
  ('API Gateway', '44316444', NOW(), NOW()),
  ('Monitoring & Alerting System', '45228804', NOW(), NOW());

-- Insert comprehensive change requests covering all scenarios
INSERT INTO change_requests (change_id, title, description, change_type, scheduled_start_time, scheduled_end_time, status, created_at, updated_at) VALUES
  ('CR-2025-001234', 'Database Schema Update', 'Update user table schema to support new authentication fields. This change includes adding columns for multi-factor authentication and improving indexing.', 'P2', '2025-01-22 02:00:00', '2025-01-22 04:00:00', 'active', '2025-01-15 09:00:00', NOW()),
  
  ('CR-2025-001235', 'Security Patch Deployment', 'Critical security patches for authentication vulnerabilities. Immediate deployment required to prevent potential security breaches.', 'P1', '2025-01-20 01:00:00', '2025-01-20 03:00:00', 'active', '2025-01-14 14:30:00', NOW()),
  
  ('CR-2025-001236', 'Performance Optimization', 'Optimize database queries and implement caching for better application performance. Expected 40% improvement in response times.', 'Standard', '2025-01-25 03:00:00', '2025-01-25 05:00:00', 'active', '2025-01-16 11:15:00', NOW()),
  
  ('CR-2025-001237', 'Emergency SQL Injection Fix', 'Urgent fix for SQL injection vulnerability discovered in payment processing module. Immediate patching required.', 'Emergency', '2025-01-19 00:30:00', '2025-01-19 02:30:00', 'active', '2025-01-18 22:45:00', NOW()),
  
  ('CR-2025-001238', 'Load Balancer Configuration', 'Update load balancer settings to handle increased traffic during peak hours. Configure auto-scaling policies.', 'P1', '2025-01-21 02:30:00', '2025-01-21 04:30:00', 'active', '2025-01-17 16:20:00', NOW()),
  
  ('CR-2025-001239', 'Email Template Updates', 'Update email templates for better user experience and brand compliance. New responsive design implementation.', 'Standard', '2025-01-24 01:00:00', '2025-01-24 02:00:00', 'active', '2025-01-18 08:45:00', NOW()),
  
  ('CR-2025-001240', 'API Rate Limiting Implementation', 'Implement rate limiting for public APIs to prevent abuse and ensure fair usage across all clients.', 'P2', '2025-01-23 03:00:00', '2025-01-23 05:00:00', 'active', '2025-01-16 13:30:00', NOW()),
  
  ('CR-2025-001241', 'Database Index Optimization', 'Add new indexes and optimize existing ones for frequently queried tables. Performance enhancement focus.', 'Standard', '2025-01-26 02:00:00', '2025-01-26 04:00:00', 'active', '2025-01-19 10:00:00', NOW()),
  
  ('CR-2025-001242', 'Mobile Authentication Fix', 'Fix authentication issues in mobile application affecting iOS users. Critical user experience improvement.', 'P1', '2025-01-20 04:00:00', '2025-01-20 06:00:00', 'active', '2025-01-18 15:30:00', NOW()),
  
  ('CR-2025-001243', 'SSL Certificate Renewal', 'Renew SSL certificates for all production domains. Prevent service interruption due to certificate expiry.', 'P1', '2025-01-21 01:00:00', '2025-01-21 02:00:00', 'active', '2025-01-17 09:15:00', NOW()),
  
  ('CR-2025-001244', 'Feature Flag Cleanup', 'Remove deprecated feature flags and clean up related code. Technical debt reduction initiative.', 'Standard', '2025-01-27 02:00:00', '2025-01-27 04:00:00', 'active', '2025-01-19 14:20:00', NOW()),
  
  ('CR-2025-001245', 'Data Migration Phase 1', 'Migrate legacy customer data to new database structure. First phase of complete system modernization.', 'P1', '2025-01-22 01:00:00', '2025-01-22 06:00:00', 'active', '2025-01-15 11:45:00', NOW()),
  
  ('CR-2025-001246', 'Backup System Enhancement', 'Enhance backup procedures and add redundancy to critical data storage systems.', 'P2', '2025-01-25 01:00:00', '2025-01-25 03:00:00', 'active', '2025-01-18 12:30:00', NOW()),
  
  ('CR-2025-001247', 'Network Infrastructure Upgrade', 'Upgrade network infrastructure to support higher bandwidth and improved reliability.', 'Standard', '2025-01-28 02:00:00', '2025-01-28 08:00:00', 'active', '2025-01-19 16:00:00', NOW()),
  
  ('CR-2025-001248', 'Emergency Cache Clear', 'Emergency cache clearing due to corrupted data affecting user sessions. Immediate action required.', 'Emergency', '2025-01-19 23:00:00', '2025-01-19 23:30:00', 'active', '2025-01-19 22:30:00', NOW()),
  
  ('CR-2025-001249', 'Monitoring System Update', 'Update monitoring and alerting system with new metrics and improved notification channels.', 'P2', '2025-01-24 02:00:00', '2025-01-24 04:00:00', 'active', '2025-01-17 14:15:00', NOW()),
  
  ('CR-2025-001250', 'User Interface Refresh', 'Refresh user interface components for better accessibility and modern design standards.', 'Standard', '2025-01-26 01:00:00', '2025-01-26 03:00:00', 'active', '2025-01-18 10:45:00', NOW()),
  
  ('CR-2025-001251', 'Security Certificate Renewal', 'Annual renewal of security certificates and compliance updates. Completed successfully.', 'P1', '2025-01-15 02:00:00', '2025-01-15 04:00:00', 'active', '2025-01-10 09:00:00', NOW()),
  
  ('CR-2025-001252', 'Database Migration Phase 2', 'Second phase of database migration with improved performance metrics. Currently in progress.', 'P1', '2025-01-19 01:00:00', '2025-01-19 05:00:00', 'active', '2025-01-16 08:30:00', NOW()),
  
  ('CR-2025-001253', 'Legacy System Decommission', 'Decommission old legacy systems and migrate remaining dependencies. Completed ahead of schedule.', 'P2', '2025-01-18 02:00:00', '2025-01-18 06:00:00', 'active', '2025-01-12 14:00:00', NOW()),
  
  ('CR-2025-001254', 'Performance Fix Critical', 'Critical performance fix for payment processing delays affecting customer transactions.', 'Emergency', '2025-01-19 21:00:00', '2025-01-19 23:00:00', 'active', '2025-01-19 20:15:00', NOW()),
  
  ('CR-2025-001255', 'Microservices Architecture Update', 'Update microservices to latest version with improved error handling and resilience.', 'Standard', '2025-01-27 01:00:00', '2025-01-27 06:00:00', 'active', '2025-01-19 11:30:00', NOW());

-- Insert change request applications with diverse validation statuses

-- CR-2025-001234 (Database Schema Update) - Mix of statuses
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (1, 1, 'completed', 'completed', 'Pre-validation completed successfully. Database connection verified.', 'Post-validation confirmed. Schema changes applied correctly.', '2025-01-15 10:30:00', '2025-01-15 12:45:00'),
  (1, 3, 'completed', 'in_progress', 'Pre-validation passed. Inventory system ready for schema changes.', NULL, '2025-01-15 11:00:00', NULL),
  (1, 13, 'in_progress', 'pending', NULL, NULL, NULL, NULL);

-- CR-2025-001235 (Security Patch) - High priority, mostly completed
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (2, 1, 'completed', 'completed', 'Security scan completed. No vulnerabilities detected.', 'Patches applied successfully. System secured.', '2025-01-14 15:00:00', '2025-01-14 17:30:00'),
  (2, 2, 'completed', 'completed', 'Payment gateway security validated.', 'All security patches deployed. Testing confirmed.', '2025-01-14 15:15:00', '2025-01-14 17:45:00'),
  (2, 11, 'completed', 'in_progress', 'Authentication service pre-checks passed.', NULL, '2025-01-14 15:30:00', NULL);

-- CR-2025-001236 (Performance Optimization) - Standard priority, mixed progress
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (3, 5, 'completed', 'pending', 'Analytics dashboard baseline performance recorded.', NULL, '2025-01-16 12:00:00', NULL),
  (3, 13, 'in_progress', 'pending', NULL, NULL, NULL, NULL),
  (3, 15, 'pending', 'pending', NULL, NULL, NULL, NULL);

-- CR-2025-001237 (Emergency SQL Injection Fix) - Emergency, urgent completion
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (4, 2, 'completed', 'completed', 'Payment gateway vulnerability confirmed and isolated.', 'Emergency patch applied. Vulnerability resolved.', '2025-01-18 23:00:00', '2025-01-19 01:15:00'),
  (4, 1, 'completed', 'completed', 'Customer portal security validated.', 'SQL injection points secured. Testing passed.', '2025-01-18 23:15:00', '2025-01-19 01:30:00');

-- CR-2025-001238 (Load Balancer) - P1 priority, in progress
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (5, 6, 'completed', 'in_progress', 'Mobile backend load testing completed.', NULL, '2025-01-17 17:00:00', NULL),
  (5, 14, 'in_progress', 'pending', NULL, NULL, NULL, NULL),
  (5, 1, 'pending', 'pending', NULL, NULL, NULL, NULL);

-- CR-2025-001239 (Email Templates) - Standard, progressing well
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (6, 4, 'completed', 'completed', 'Email service templates reviewed and approved.', 'New templates deployed successfully. Design approved.', '2025-01-18 09:30:00', '2025-01-18 11:45:00'),
  (6, 7, 'completed', 'pending', 'Notification service integration verified.', NULL, '2025-01-18 10:00:00', NULL);

-- CR-2025-001240 (API Rate Limiting) - P2 priority, mixed status
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (7, 14, 'completed', 'in_progress', 'API Gateway rate limiting configuration validated.', NULL, '2025-01-16 14:00:00', NULL),
  (7, 10, 'in_progress', 'pending', NULL, NULL, NULL, NULL),
  (7, 6, 'pending', 'pending', NULL, NULL, NULL, NULL);

-- CR-2025-001241 (Database Indexing) - Standard, early stage
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (8, 13, 'in_progress', 'pending', NULL, NULL, NULL, NULL),
  (8, 3, 'pending', 'pending', NULL, NULL, NULL, NULL),
  (8, 5, 'pending', 'pending', NULL, NULL, NULL, NULL);

-- CR-2025-001242 (Mobile Auth Fix) - P1, critical progress
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (9, 6, 'completed', 'completed', 'Mobile backend authentication issues identified and isolated.', 'Authentication fix deployed. iOS issues resolved.', '2025-01-18 16:00:00', '2025-01-18 19:30:00'),
  (9, 11, 'completed', 'in_progress', 'User authentication service compatibility verified.', NULL, '2025-01-18 16:30:00', NULL);

-- CR-2025-001243 (SSL Certificate) - P1, proceeding on schedule
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (10, 1, 'completed', 'pending', 'SSL certificate validation completed for customer portal.', NULL, '2025-01-17 10:00:00', NULL),
  (10, 2, 'completed', 'pending', 'Payment gateway SSL requirements verified.', NULL, '2025-01-17 10:15:00', NULL),
  (10, 14, 'in_progress', 'pending', NULL, NULL, NULL, NULL);

-- Continue with remaining change requests following the same pattern...

-- CR-2025-001251 (Completed Security Certificate) - All completed
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (18, 1, 'completed', 'completed', 'Security certificate pre-validation passed.', 'New certificates installed and verified.', '2025-01-10 10:00:00', '2025-01-10 14:00:00'),
  (18, 2, 'completed', 'completed', 'Payment gateway certificate validation complete.', 'Certificate renewal successful. All tests passed.', '2025-01-10 10:30:00', '2025-01-10 14:30:00'),
  (18, 11, 'completed', 'completed', 'Authentication service certificate updated.', 'Security validation completed successfully.', '2025-01-10 11:00:00', '2025-01-10 15:00:00');

-- CR-2025-001252 (Database Migration In Progress)
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (19, 13, 'completed', 'in_progress', 'Database migration pre-checks completed successfully.', NULL, '2025-01-16 09:00:00', NULL),
  (19, 3, 'in_progress', 'pending', NULL, NULL, NULL, NULL),
  (19, 5, 'in_progress', 'pending', NULL, NULL, NULL, NULL);

-- CR-2025-001253 (Legacy System Decommission Completed)
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  (20, 10, 'completed', 'completed', 'Legacy integration dependencies mapped and verified.', 'Legacy system successfully decommissioned. Migration complete.', '2025-01-12 15:00:00', '2025-01-12 19:00:00'),
  (20, 12, 'completed', 'completed', 'Content management system legacy connections removed.', 'Decommission completed. New connections established.', '2025-01-12 15:30:00', '2025-01-12 19:30:00');

-- Add more applications to remaining change requests for comprehensive coverage
INSERT INTO change_request_applications (change_request_id, application_id, pre_change_status, post_change_status, pre_change_comment, post_change_comment, pre_change_updated_at, post_change_updated_at) VALUES
  -- CR-2025-001244 (Feature Flag Cleanup)
  (11, 1, 'pending', 'pending', NULL, NULL, NULL, NULL),
  (11, 5, 'pending', 'pending', NULL, NULL, NULL, NULL),
  (11, 12, 'pending', 'pending', NULL, NULL, NULL, NULL),
  
  -- CR-2025-001245 (Data Migration Phase 1)
  (12, 13, 'completed', 'in_progress', 'Data migration validation completed. Ready for transfer.', NULL, '2025-01-15 12:30:00', NULL),
  (12, 1, 'completed', 'pending', 'Customer portal data mapping verified.', NULL, '2025-01-15 13:00:00', NULL),
  (12, 2, 'in_progress', 'pending', NULL, NULL, NULL, NULL),
  
  -- CR-2025-001246 (Backup System Enhancement)
  (13, 8, 'completed', 'pending', 'File storage backup procedures validated.', NULL, '2025-01-18 13:00:00', NULL),
  (13, 13, 'in_progress', 'pending', NULL, NULL, NULL, NULL),
  (13, 9, 'pending', 'pending', NULL, NULL, NULL, NULL),
  
  -- CR-2025-001247 (Network Infrastructure)
  (14, 14, 'pending', 'pending', NULL, NULL, NULL, NULL),
  (14, 6, 'pending', 'pending', NULL, NULL, NULL, NULL),
  (14, 7, 'pending', 'pending', NULL, NULL, NULL, NULL),
  
  -- CR-2025-001248 (Emergency Cache Clear)
  (15, 1, 'completed', 'completed', 'Customer portal cache cleared and validated.', 'Cache rebuild completed. Performance restored.', '2025-01-19 22:45:00', '2025-01-19 23:15:00'),
  (15, 5, 'completed', 'completed', 'Analytics dashboard cache cleared.', 'Cache optimization applied. System responsive.', '2025-01-19 22:50:00', '2025-01-19 23:20:00'),
  
  -- CR-2025-001249 (Monitoring System)
  (16, 15, 'completed', 'in_progress', 'Monitoring system baseline metrics captured.', NULL, '2025-01-17 15:00:00', NULL),
  (16, 9, 'in_progress', 'pending', NULL, NULL, NULL, NULL),
  
  -- CR-2025-001250 (UI Refresh)
  (17, 1, 'in_progress', 'pending', NULL, NULL, NULL, NULL),
  (17, 12, 'pending', 'pending', NULL, NULL, NULL, NULL),
  
  -- CR-2025-001254 (Performance Fix Critical)
  (21, 2, 'completed', 'completed', 'Payment processing performance issues identified.', 'Critical performance fix deployed. Transaction speeds restored.', '2025-01-19 20:30:00', '2025-01-19 22:45:00'),
  (21, 1, 'completed', 'in_progress', 'Customer portal performance baseline established.', NULL, '2025-01-19 20:45:00', NULL),
  
  -- CR-2025-001255 (Microservices Update)
  (22, 6, 'pending', 'pending', NULL, NULL, NULL, NULL),
  (22, 10, 'pending', 'pending', NULL, NULL, NULL, NULL),
  (22, 14, 'pending', 'pending', NULL, NULL, NULL, NULL);