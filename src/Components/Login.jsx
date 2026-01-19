import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Icon,
  TextField,
} from "@mui/material";
import { supabase } from "../supabase";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { FaUserPlus } from "react-icons/fa";
import logo from "./assets/img/logo.webp";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Automatically append @gmail.com
    const email = username.includes("@") ? username : `${username}@gmail.com`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      toast.error(error.message);
    } else {
      setLoading(false);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    }
  };

  const [email, setEmail] = useState("");
  const [resetloader, setResetLoader] = useState(false);

  const sendResetLink = async () => {
    setResetLoader(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
      flowType: "pkce", //
    });

    if (error) {
      toast.error(error.message);
      setResetLoader(false);
    } else {
      toast.success("Password reset link sent to your email.");
      setTimeout(() => {
        setResetLoader(false);
      },60000);
    }
  };

  return (
    <>
      <ToastContainer />

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Reset Password</DialogTitle>

        <DialogContent style={{ minWidth: "340px" }}>
          <TextField
            id="email"
            fullWidth
            label="Resgistered Email"
            size="small"
            onChange={(e) => setEmail(e.target.value)}
            //  value={formData.remark}
            //  onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button
            variant="contained"
            disabled={resetloader}
            onClick={sendResetLink}
          >
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>

      <div className="login-wrapper d-flex align-items-center justify-content-center">
        <div className="login-card shadow p-4 rounded">
          <div className="text-center mb-3">
            <h3 className="fw-bold">
              <img src={logo} style={{ width: "160px" }} />
            </h3>
            <p className="text-muted mb-1">Sign in to continue</p>
            <hr />
          </div>

          <Form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="text"
              label="Username"
              size="small"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              fullWidth
              style={{ marginTop: "10px" }}
              label="Password"
              size="small"
              required
              type={showPassword ? "text" : "password"}
              value={password}
              InputProps={{
                endAdornment: (
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ marginLeft: 8, cursor: "pointer" }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                ),
              }}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* <div className="d-flex justify-content-between align-items-center my-2">
              <Link className="text-decoration-none" onClick={handleClickOpen}>
                Forgot Password?
              </Link>
            </div> */}
            <div className="text-center mt-2">
              <Button
                type="submit"
                primary
                fullWidth
                variant="contained"
                disabled={loading}
              >
                {loading ? <>Validating. Please wait...</> : <>Login</>}
              </Button>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-4">
              <Link
                className="text-decoration-none"
                style={{ color: "red" }}
                to="/genarate-userid"
              >
                <FaUserPlus style={{ marginTop: "-3px" }} /> Generate User
                Credentials
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Login;
