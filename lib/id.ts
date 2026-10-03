import { customAlphabet } from "nanoid";

// Lowercase alphanumerics, no ambiguous characters - short and URL-friendly.
const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";

export const newWidgetId = customAlphabet(alphabet, 8);
export const newFieldId = customAlphabet(alphabet, 6);
export const newSubmissionId = customAlphabet(alphabet, 10);
export const newUserId = customAlphabet(alphabet, 10);
