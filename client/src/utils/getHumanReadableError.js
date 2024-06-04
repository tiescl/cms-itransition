export default function getHumanReadableError(error_message) {
  switch (error_message) {
    case 'incorrect_email':
      return 'User with the given email does not exist.';
    case 'incorrect_password':
      return 'Entered password is invalid.';
    case 'user_blocked':
      return 'Your account has been blocked. Stay cool✌️';
    case 'email_in_use':
      return `The email you provided is already in use. Consider joining us with another one.`;
    case 'operation_forbidden':
      return 'Sign in required to create, edit, and like collections, as well as add comments.';
    case 'missing_required_fields':
      return 'Some required fields are invalid or missing.';
    case 'missing_item_fields':
      return 'Item fields (name and value) must not be empty.';
    case 'collection_not_found':
      return 'Collection not found. Does it exist?';
    case 'empty_comment':
      return 'Comments should not be empty.';
    case 'comment_collection_not_found' || 'comment_add_failed':
      return 'There was a problem adding your comment.';
    case 'collection_delete_failed':
      return 'Failed to delete the collection. Please try again later.';
    case 'collection_like_failed':
      return 'Failed to like the collection. Please try again later.';
    case 'collection_unlike_failed':
      return 'Failed to unlike the collection. Please try again later.';
    case 'likes_count_error':
      return "Can't go lower than that, can we?";
    default:
      return 'Something went wrong. Please try again';
  }
}
