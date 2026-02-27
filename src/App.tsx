import { useEffect } from "react";
import axios from "axios";

function App() {

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const interval = setInterval(() => {
      axios.post(
        `${import.meta.env.VITE_API_URL}/auth/heartbeat`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Sistema funcionando</h1>
    </div>
  );
}

export default App;