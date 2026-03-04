/**
 * Extracts a clean, user-friendly error message from a DRF API error response.
 *
 * DRF can return errors in many shapes:
 *  - { "detail": "Not found." }
 *  - { "size": ["Variant with size 'M' already exists."] }
 *  - { "non_field_errors": ["..."] }
 *  - { "variants": [{ "size": ["..."] }] }
 *  - A plain string
 *
 * @param {any} error - The error caught in a try/catch (Axios error)
 * @param {string} [fallback="Something went wrong. Please try again."] - Default message
 * @returns {string}
 */
export function parseApiError(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;

  if (!data) return error?.message || fallback;

  // Plain string
  if (typeof data === "string") return data;

  // { "detail": "..." }
  if (typeof data.detail === "string") return data.detail;

  if (typeof data === "object" && !Array.isArray(data)) {
    // Iterate over each key and flatten the first readable message
    for (const key of Object.keys(data)) {
      const value = data[key];

      // { "size": ["message"] } or { "size": "message" }
      if (Array.isArray(value)) {
        const first = value[0];
        // Can be a nested object e.g. variant array of objects
        if (typeof first === "string") {
          const label = key === "non_field_errors" ? "" : `${key}: `;
          return `${label}${first}`;
        }
        // Nested array of objects: { "variants": [{ "size": ["..."] }] }
        if (typeof first === "object" && first !== null) {
          for (const nestedKey of Object.keys(first)) {
            const nestedVal = first[nestedKey];
            if (Array.isArray(nestedVal) && typeof nestedVal[0] === "string") {
              return `${nestedKey}: ${nestedVal[0]}`;
            }
          }
        }
      }

      if (typeof value === "string") {
        const label = key === "non_field_errors" ? "" : `${key}: `;
        return `${label}${value}`;
      }
    }
  }

  return fallback;
}
