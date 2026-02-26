const getErrorMessage = (error) => {
  // If the error IS the data payload already (e.g. from Redux rejectWithValue payload)
  const data = error?.response?.data || error;

  if (error?.isAxiosError && !error.response) {
    return "Network error. Please check your connection.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.non_field_errors) {
    return data.non_field_errors[0];
  }

  if (data.error) {
    return data.error;
  }

  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const value = data[firstKey];
    if (Array.isArray(value)) {
      return value[0];
    }
    if (typeof value === "string") {
      return value;
    }
  }

  return "Something went wrong";
};

export default getErrorMessage;