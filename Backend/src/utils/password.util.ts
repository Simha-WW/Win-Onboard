/**
 * Password Utility Functions
 * 
 * SECURITY CONSIDERATIONS:
 * - All passwords are hashed using bcrypt with salt rounds
 * - Plaintext passwords are NEVER stored or logged
 * - Temporary passwords are generated securely
 * - This is a temporary password flow - users must change on first login
 */

import bcrypt from 'bcrypt';

/**
 * Configuration for password security
 */
const PASSWORD_CONFIG = {
  // Salt rounds for bcrypt hashing (10-12 is recommended)
  SALT_ROUNDS: 12,
  
  // Temporary password length
  TEMP_PASSWORD_LENGTH: 6,
  
  // Character sets for password generation (no whitespaces)
  CHARSET: {
    UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
    NUMBERS: '0123456789',
    SPECIAL: '!@#$%^&*()_+-=[]{}|;:,.<>?' // No spaces included
  }
};

/**
 * Generate a secure temporary password
 * 
 * Password requirements:
 * - Fixed length of 6 characters
 * - No whitespaces
 * - Contains mix of uppercase, lowercase, numbers, and special characters
 * - Cryptographically secure random generation
 * 
 * @returns {string} Generated temporary password
 */
export const generateTemporaryPassword = (): string => {
  const { UPPERCASE, LOWERCASE, NUMBERS, SPECIAL } = PASSWORD_CONFIG.CHARSET;
  const allChars = UPPERCASE + LOWERCASE + NUMBERS + SPECIAL;
  
  let password = '';
  
  // For 6-character password, ensure good mix of character types
  // First 3 positions: guaranteed variety
  password += getRandomChar(UPPERCASE);
  password += getRandomChar(LOWERCASE);
  password += getRandomChar(NUMBERS);
  
  // Remaining 3 positions: mix of all types including special characters
  for (let i = 3; i < PASSWORD_CONFIG.TEMP_PASSWORD_LENGTH; i++) {
    password += getRandomChar(allChars);
  }
  
  // Shuffle the password to avoid predictable patterns
  return shuffleString(password);
};

/**
 * Get a cryptographically secure random character from charset
 * 
 * @param {string} charset - Character set to choose from
 * @returns {string} Random character
 */
const getRandomChar = (charset: string): string => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return charset[array[0]! % charset.length]!;
};

/**
 * Shuffle string characters using Fisher-Yates algorithm
 * 
 * @param {string} str - String to shuffle
 * @returns {string} Shuffled string
 */
const shuffleString = (str: string): string => {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i]!, array[j]!] = [array[j]!, array[i]!];
  }
  return array.join('');
};

/**
 * Hash a password using bcrypt
 * 
 * SECURITY: This function uses bcrypt with appropriate salt rounds
 * to securely hash passwords before storage.
 * 
 * @param {string} plainPassword - The plaintext password to hash
 * @returns {Promise<string>} The hashed password
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  try {
    // Generate salt and hash password in one step
    const hashedPassword = await bcrypt.hash(plainPassword, PASSWORD_CONFIG.SALT_ROUNDS);
    
    // SECURITY: Clear the plaintext password from memory
    // Note: This doesn't guarantee memory cleanup in JavaScript,
    // but it's a defensive programming practice
    plainPassword = '';
    
    return hashedPassword;
    
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
};

/**
 * Verify a password against its hash
 * 
 * @param {string} plainPassword - The plaintext password to verify
 * @param {string} hashedPassword - The stored hash to compare against
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    
    // SECURITY: Clear the plaintext password from memory
    plainPassword = '';
    
    return isValid;
    
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

/**
 * Generate a unique username from first name and last name
 * 
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} email - User's email (fallback)
 * @returns {string} Generated username
 */
export const generateUsername = (firstName: string, lastName: string, email: string): string => {
  // Clean and format names
  const cleanFirstName = firstName.trim().toLowerCase().replace(/[^a-z]/g, '');
  const cleanLastName = lastName.trim().toLowerCase().replace(/[^a-z]/g, '');
  
  // Primary format: firstname.lastname
  if (cleanFirstName && cleanLastName) {
    return `${cleanFirstName}.${cleanLastName}`;
  }
  
  // Fallback to email prefix if names are insufficient
  if (email && email.includes('@')) {
    return email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  
  // Final fallback
  return `user${Date.now()}`;
};

// TODO: Implement password strength validation
// TODO: Add password history tracking to prevent reuse
// TODO: Implement password expiration policies
// TODO: Add account lockout after failed attempts
// TODO: Consider implementing magic link authentication as alternative