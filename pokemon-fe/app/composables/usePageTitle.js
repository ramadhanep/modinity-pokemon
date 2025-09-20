export const usePageTitle = () => {
  const config = useRuntimeConfig();
  const site = config.public.siteName;

  const setTitle = (title) =>
    useHead({ title: title ? `${title} - ${site}` : site });
  const build = (title) => (title ? `${title} - ${site}` : site);

  return { setTitle, build, site };
};
