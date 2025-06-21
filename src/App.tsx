import { useAuthStore } from "@/store/auth";
import { Navigate, Outlet } from "react-router-dom";
import { Button } from "./components/ui/button";

function App() {
  const { accessToken, actions } = useAuthStore((state) => ({
    accessToken: state.accessToken,
    actions: state.actions,
  }));

  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
      <p>This is a protected route.</p>
      <Button onClick={() => actions.logout()} className="mt-4">
        Logout
      </Button>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
