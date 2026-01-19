import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const initSessionFromUrl = async () => {
      const hash = window.location.hash; // e.g. #access_token=...
      if (!hash) {
        setErrorMsg("No token found in URL.");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(hash.replace("#", ""));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (!access_token || !refresh_token) {
        setErrorMsg("Invalid or expired reset link.");
        setLoading(false);
        return;
      }

      // Set Supabase session using tokens from URL
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSessionReady(true);
      }

      // Remove the #access_token fragment from URL for security/cleanliness
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );

      setLoading(false);
    };

    initSessionFromUrl();
  }, []);

  const updatePassword = async () => {
    if (!password) {
      alert("Please enter a password.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully! Redirecting to login...");
      // Optional: delay to let user read message
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  if (loading) return <p>Verifying reset link...</p>;

  if (errorMsg) return <p style={{ color: "red" }}>{errorMsg}</p>;

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>Reset Password</h2>
      {sessionReady ? (
        <>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
          />
          <button
            onClick={updatePassword}
            style={{ width: "100%", padding: "10px", cursor: "pointer" }}
          >
            Update Password
          </button>
        </>
      ) : (
        <p>Setting up your session...</p>
      )}
    </div>
  );
}
