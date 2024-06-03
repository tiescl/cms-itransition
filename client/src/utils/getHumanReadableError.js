export default function getHumanReadableError(error_message) {
  switch (error_message) {
    case 'incorrect_email' || 'incorrect_password':
      return 'User with the given email does not exist.';
    case 'incorrect_password':
      return 'Entered password is invalid.';
    case 'user_blocked':
      return 'Your account has been blocked. Stay cool✌️';
    case 'email_in_use':
      return `The email you provided is already in use. Consider joining us with another one.`;
    case 'operation_forbidden':
      return 'You need to be signed in to create collections.';
    case 'missing_required_fields':
      return 'Some required fields are invalid or missing.';
    case 'missing_item_fields':
      return 'Item fields (name and value) must not be empty.';
    default:
      return 'Something went wrong. Please try again';
  }
}
