/**
 * Utility functions for avatar display
 */

export interface User {
  email?: string;
  username?: string;
  name?: string;
}

/**
 * Extracts the display initial from user data
 * Priority: email (before @) > username > name > fallback
 */
export const getAvatarInitial = (user?: User): string => {
  if (!user) return "U";

  // Try to extract a display name from email first
  if (user.email) {
    const emailName = user.email.split("@")[0];
    
    // If email name looks like a name (starts with letter, reasonable length)
    if (
      emailName &&
      emailName.length > 0 &&
      /^[a-zA-Z]/.test(emailName)
    ) {
      return emailName.charAt(0).toUpperCase();
    }
  }

  // Fallback to username
  if (user.username) {
    return user.username.charAt(0).toUpperCase();
  }

  // Fallback to name
  if (user.name) {
    return user.name.charAt(0).toUpperCase();
  }

  // Final fallback
  return "U";
};

/**
 * Gets the display name for the user
 * Priority: email (before @) > username > name > fallback
 */
export const getDisplayName = (user?: User): string => {
  if (!user) return "User";

  // Try to extract a display name from email first
  if (user.email) {
    const emailName = user.email.split("@")[0];
    
    // If email name looks like a name (starts with letter, reasonable length)
    if (
      emailName &&
      emailName.length > 0 &&
      /^[a-zA-Z]/.test(emailName)
    ) {
      return emailName;
    }
  }

  // Fallback to username
  if (user.username) {
    return user.username;
  }

  // Fallback to name
  if (user.name) {
    return user.name;
  }

  // Final fallback
  return "User";
}; 