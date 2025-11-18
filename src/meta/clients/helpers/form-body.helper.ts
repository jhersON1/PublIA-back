export const buildFormBody = (params: Record<string, string>): URLSearchParams => {
  return new URLSearchParams(params);
};
