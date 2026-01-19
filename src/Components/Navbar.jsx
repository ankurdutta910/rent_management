import React, { useEffect, useState } from "react";
import { supabase } from "../supabase"; // adjust path if needed
import { Link, useNavigate } from "react-router-dom";
import logo from "./assets/img/logo.webp";
import { RiMenu4Line } from "react-icons/ri";
import { FaSignOutAlt } from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
import { RiSecurePaymentFill } from "react-icons/ri";
import { FaUserTag } from "react-icons/fa";

function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("tenant");

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(data?.user ?? null);
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  // ✅ Check user role when user changes
  // ✅ Check user role from Supabase "Admin" table
  useEffect(() => {
    if (!user?.id) return;

    async function checkUserRole() {
      try {
        // Query the Admin table for a record with this user’s id
        const { data, error } = await supabase
          .from("Admin")
          .select("user_id")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          // user exists in Admin table
          setUserRole("admin");
        } else {
          setUserRole("tenant");
        }
      } catch (err) {
        console.error("Error checking user role:", err);
        setUserRole("tenant");
      }
    }

    checkUserRole();
  }, [user]);

  const navigate = useNavigate();
  // ✅ Logout function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      navigate("/login"); // redirect after logout
    }
  };
  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid navbar-content">
          <Link className="navbar-brand" href="/">
            <img src={logo} className="img-fluid logoimg" />
          </Link>
          <RiMenu4Line
            className="navbar-togg"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          />

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {/* <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Link
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link disabled" aria-disabled="true">
                  Disabled
                </a>
              </li> */}
            </ul>
            <form className="d-flex nav-items">
              {userRole === "admin" ? (
                <>
                  <ul className="navbar-nav">
                    <li className="nav-item">
                      <Link
                        className="nav-link active"
                        aria-current="page"
                        to="/"
                      >
                        Home
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin-assets">
                        Assets
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin-tenants">
                        Tenants
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" to="/admin-rentals">
                        Rentals
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        style={{ color: "red" }}
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt /> Log Out
                      </Link>
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <ul className="navbar-nav">
                    <li className="nav-item">
                      <Link
                        className="nav-link active"
                        aria-current="page"
                        to="/dashboard"
                      >
                        <LuLayoutDashboard
                          style={{ marginTop: "-3px", color: "gray" }}
                        />{" "}
                        Home
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" to="/my-rents">
                        <RiSecurePaymentFill style={{ marginTop: "-3px", color: "grey" }} />{" "} My Rents
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" to="/my-profile">
                       <FaUserTag style={{ color: "grey", marginTop: "-3px" }} /> My Profile
                      </Link>

                        </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link"
                          style={{ color: "red" }}
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt /> Log Out
                        </Link>
                      </li>
                  </ul>
                </>
              )}
            </form>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
