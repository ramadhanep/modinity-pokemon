/**
 * Lightweight HTTP client for your internal API.
 * - Reads base URL from runtimeConfig.public.apiBase
 * - Exposes: get(path), post(path, body), del(path)
 * - Normalizes errors to "CODE: message" (relies on backend returning { code, error })
 */
export const useApi = () => {
  const config = useRuntimeConfig();
  const base = config.public.apiBase;

  const get = async (path) => {
    try {
      return await $fetch(path, { baseURL: base });
    } catch (e) {
      throw formatErr(e);
    }
  };

  const post = async (path, body) => {
    try {
      return await $fetch(path, {
        baseURL: base,
        method: "POST",
        body,
      });
    } catch (e) {
      throw formatErr(e);
    }
  };

  const del = async (path) => {
    try {
      return await $fetch(path, {
        baseURL: base,
        method: "DELETE",
      });
    } catch (e) {
      throw formatErr(e);
    }
  };

  // Convert $fetch/Nitro error shapes to Error("CODE: message")
  const formatErr = (e) => {
    const code = e?.data?.code || "ERROR";
    const msg = e?.data?.error || e?.message || "Unknown error";
    return new Error(`${code}: ${msg}`);
  };

  return { get, post, del };
};
