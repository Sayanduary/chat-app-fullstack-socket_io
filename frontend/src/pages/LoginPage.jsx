import { useAuthStore } from "../store/useAuth.store";

const LoginPage = () => {
  const { authUser, isLoading, login } = useAuthStore();
  return <div>LoginPage</div>;
};

export default LoginPage;
