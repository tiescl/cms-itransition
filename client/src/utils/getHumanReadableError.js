export default function getHumanReadableError(error_message) {
  switch (error_message) {
    case 'Load failed':
      return 'Failed to load data.';
    case 'request_canceled':
      return '';
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
    case 'invalid_collection_fields':
      return "Please ensure you are not putting Homer's Odyssey novel into description or name.";
    case 'invalid_item_fields':
      return 'Choose a shorter name for the item. Short names are great and memorable.';
    case 'invalid_item_field_values':
      return 'Some field values are too long. Have you tried shortening them with Quillbot?';
    case 'invalid_custom_fields':
      return 'Item fields cannot be so lengthy, you will bore your readers!';
    case 'too_many_tags':
      return "Too many tags. Spamming ain't so good";
    case 'invalid_tag_fields':
      return 'We kindly ask you to keep your tags short and neat)';
    case 'missing_required_fields':
      return 'Some required fields are invalid or missing.';
    case 'missing_custom_fields':
      return 'Item fields (name and value) must not be empty.';
    case 'collection_not_found':
      return 'Collection not found. Does it exist?';
    case 'item_not_found':
      return 'Item not found. Does it exist?';
    case 'item_collection_not_found':
      return 'Wrong URL. Did you get lost?';
    case 'empty_comment':
      return 'Comments should not be empty.';
    case 'comment_item_not_found' || 'comment_add_failed':
      return 'There was a problem adding your comment.';
    case 'collection_fetch_failed':
      return 'Failed to fetch collection data. Please try again.';
    case 'item_fetch_failed':
      return 'Failed to fetch item data. Please try again.';
    case 'collection_delete_failed':
      return 'Failed to delete collection. Please try again later.';
    case 'item_delete_failed':
      return 'Failed to delete item. Please try again later.';
    case 'item_like_toggle_failed':
      return 'Failed to like/unlike the item. Please try again later.';
    case 'name_fields_required':
      return "Name and all custom fields are required. Make sure they don't contain extra spaces or characters.";
    default:
      return 'Something went wrong. Please try again';
  }
}
