export const normalizeUrl = (value, fallback) => {
  if (!value) return fallback;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^\/\//.test(value)) {
    return `https:${value}`;
  }

  if (/^(localhost|127(?:\.\d{1,3}){3})(:\d+)?(\/.*)?$/i.test(value)) {
    return `http://${value}`;
  }

  return `https://${value}`;
};

export const getSafeImageSrc = (value, fallback = "/avatar.svg") => {
  if (!value) return fallback;

  if (typeof value !== "string") return fallback;

  if (
    value.startsWith("/") ||
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    /^https?:\/\//i.test(value)
  ) {
    return value;
  }

  return fallback;
};
