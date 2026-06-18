export function getFriendlyAuthError(error: any): string {
  if (!error || !error.code) {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred. Please try again.";
  }

  switch (error.code) {
    case "auth/invalid-email":
      return "The email address is invalid.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account already exists with this email address.";
    case "auth/weak-password":
      return "The password is too weak. Please use at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "The sign-in popup was closed before completing the process.";
    case "auth/cancelled-popup-request":
      return "Multiple sign-in popups were opened. Please try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for sign-in.";
    case "auth/network-request-failed":
      return "A network error occurred. Please check your internet connection.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Please try again later.";
    default:
      return `Authentication failed (${error.code}). Please try again.`;
  }
}
