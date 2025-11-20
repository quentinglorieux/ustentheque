export const useDirectusBase = () => {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.public.directusBase;
};