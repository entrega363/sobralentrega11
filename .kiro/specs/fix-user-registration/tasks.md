# Implementation Plan

- [x] 1. Fix database functions and triggers




  - Create improved handle_new_user() function with robust error handling


  - Add proper logging and exception handling to prevent signup failures
  - _Requirements: 2.1, 2.2, 3.1, 3.2_






- [ ] 1.1 Create enhanced handle_new_user trigger function
  - Write function that safely creates profile with proper role from metadata
  - Add exception handling that logs errors but doesn't block user creation
  - Include email, nome, and telefone fields from user metadata

  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 1.2 Create RPC functions for role-specific user creation
  - Implement create_empresa_profile() function for empresa registration
  - Implement create_entregador_profile() function for entregador registration  
  - Implement create_consumidor_profile() function for consumidor registration

  - Each function should handle complete user creation in a single transaction
  - _Requirements: 1.1, 1.4, 3.3_

- [ ] 1.3 Add user creation logging system
  - Create user_creation_logs table for tracking registration steps
  - Add logging to all user creation functions
  - Include detailed error information for debugging
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2. Update RLS policies for user registration
  - Review and fix policies that might be blocking user creation
  - Ensure profiles table allows proper insertion during signup
  - Update empresa/entregador/consumidor policies for self-registration
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 2.1 Fix profiles table RLS policies
  - Update INSERT policy to allow user creation during signup
  - Ensure trigger functions can insert profiles with SECURITY DEFINER
  - Test policy with different user roles
  - _Requirements: 3.1, 3.2_



- [ ] 2.2 Update role-specific table policies
  - Fix empresas table INSERT policy for self-registration
  - Fix entregadores table INSERT policy for self-registration
  - Fix consumidores table INSERT policy for self-registration


  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3. Create robust signup API endpoint
  - Build new /api/auth/signup endpoint with comprehensive error handling

  - Add server-side validation using Zod schemas
  - Implement proper transaction handling for multi-step user creation
  - _Requirements: 1.1, 1.2, 1.3, 1.5_



- [ ] 3.1 Implement server-side validation
  - Create comprehensive Zod schemas for each user type
  - Add email format validation and uniqueness checking
  - Validate CNPJ format for empresas and CPF format for entregadores
  - _Requirements: 1.3, 1.5_



- [ ] 3.2 Add comprehensive error handling
  - Implement try-catch blocks for all database operations
  - Create structured error responses with specific error codes


  - Add logging for all signup attempts and failures
  - _Requirements: 1.5, 2.1, 2.2_



- [ ] 4. Improve AuthProvider error handling
  - Update signUp method to use new robust API endpoint
  - Remove setTimeout-based profile updates that cause race conditions
  - Add proper error propagation to frontend components
  - _Requirements: 1.1, 1.5, 4.1_



- [ ] 4.1 Refactor signUp method in AuthProvider
  - Replace current signUp implementation with call to new API endpoint
  - Remove unreliable setTimeout-based profile creation


  - Add proper loading states and error handling
  - _Requirements: 1.1, 1.5, 4.1_

- [x] 4.2 Add retry mechanism for failed signups


  - Implement automatic retry for transient failures
  - Add exponential backoff for retry attempts
  - Provide clear feedback to users about retry attempts


  - _Requirements: 1.5, 4.1_

- [ ] 5. Create diagnostic and testing tools
  - Build diagnostic endpoint to check system health
  - Create test endpoint for validating signup flow

  - Add frontend diagnostic panel for developers
  - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.2, 5.3_

- [ ] 5.1 Create diagnostic API endpoint
  - Build /api/auth/diagnose endpoint to check database connectivity

  - Test trigger functions and RLS policies
  - Validate schema integrity and required tables
  - _Requirements: 2.1, 2.2, 5.1, 5.2_

- [ ] 5.2 Build automated test endpoint
  - Create /api/auth/test-signup for automated testing
  - Test complete signup flow with sample data


  - Validate cleanup of test data after tests
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 5.3 Add frontend diagnostic panel
  - Create developer-only diagnostic component
  - Show system health status and recent errors
  - Provide manual test triggers for signup flow
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6. Update frontend forms with better validation
  - Add client-side validation to all registration forms
  - Improve error messaging and user feedback
  - Add loading states and success confirmations
  - _Requirements: 1.3, 1.5, 4.1_

- [ ] 6.1 Enhance empresa registration form
  - Add real-time CNPJ validation
  - Improve address validation and formatting
  - Add better error messages for each field
  - _Requirements: 1.3, 1.5_

- [ ] 6.2 Enhance entregador registration form
  - Add real-time CPF validation
  - Improve vehicle information validation
  - Add CNH validation for delivery drivers
  - _Requirements: 1.3, 1.5_

- [ ] 6.3 Add loading states and success feedback
  - Implement proper loading spinners during signup
  - Add success confirmation with next steps
  - Provide clear error messages with suggested actions
  - _Requirements: 1.5, 4.1_

- [ ] 7. Create monitoring and alerting system
  - Implement health checks for signup system
  - Add metrics tracking for signup success/failure rates
  - Create alerts for high failure rates
  - _Requirements: 2.1, 2.2, 2.3, 4.1_

- [ ] 7.1 Implement health check system
  - Create periodic health checks for database connectivity
  - Monitor trigger function execution
  - Check RLS policy effectiveness
  - _Requirements: 2.1, 2.2, 4.1_

- [ ] 7.2 Add signup metrics tracking
  - Track signup attempts, successes, and failures
  - Monitor signup completion time
  - Identify common failure points
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 8. Write comprehensive tests
  - Create unit tests for all database functions
  - Add integration tests for complete signup flow
  - Implement end-to-end tests for each user type
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8.1 Write database function tests
  - Test handle_new_user() function with various scenarios
  - Test RPC functions for each user type
  - Test error handling and rollback scenarios
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 8.2 Create API endpoint tests
  - Test signup endpoint with valid and invalid data
  - Test error scenarios and edge cases
  - Validate proper error responses and status codes
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 8.3 Add end-to-end signup tests
  - Test complete signup flow for each user type
  - Validate database state after successful signup
  - Test cleanup and rollback on failures
  - _Requirements: 5.1, 5.2, 5.3, 5.4_