import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout, fetchMe } = useAuthStore();
  return { user, isAuthenticated, isLoading, login, logout, fetchMe };
};

export default useAuth;
