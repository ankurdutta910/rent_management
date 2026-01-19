import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { RiHome9Fill } from "react-icons/ri";
import { useNavigate, useLocation } from "react-router-dom";
import { HiMiniDocumentCurrencyRupee } from "react-icons/hi2";
import { FaUser } from "react-icons/fa";
import { MdAddBox } from "react-icons/md";
import { BsFillHousesFill } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { Box, CircularProgress } from "@mui/material";

function BottomNavbar() {
  const navigate = useNavigate();
  const location = useLocation(); // <-- detects current route
  const navItemStyle = {
    userSelect: "none", // Prevent text/icon selection
    WebkitUserSelect: "none", // Safari
    MozUserSelect: "none", // Firefox
    msUserSelect: "none", // IE
  };
  const [loadingRole, setLoadingRole] = useState(true);

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
      setLoadingRole(true);

      try {
        const { data, error } = await supabase
          .from("Admin")
          .select("user_id")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        setUserRole(data ? "admin" : "tenant");
      } catch (err) {
        console.error("Error checking user role:", err);
        setUserRole("tenant");
      } finally {
        setLoadingRole(false);
      }
    }

    checkUserRole();
  }, [user]);

  if (loadingRole) {
    return null;
  }
  return (
    <>
      <div
        className="d-flex justify-content-between bottomNav"
        style={navItemStyle}
      >
        <div
          className="bn-item"
          style={
            location.pathname === "/dashboard"
              ? {
                  color: "cornflowerblue",
                }
              : {
                  cursor: "pointer",
                }
          }
          onClick={() => navigate("/dashboard")}
        >
          <RiHome9Fill />
          <p>Home</p>
        </div>

        {userRole === "admin" ? (
          <>
            <div className="bn-item" onClick={() => navigate("/admin-assets")}>
              <BsFillHousesFill />
              <p>Assets</p>
            </div>
            <div className="bn-item" onClick={() => navigate("/admin-rentals")}>
              <div
                style={{
                  marginTop: "-12px",
                  fontSize: "30px",
                  color: "cornflowerblue",
                }}
              >
                <HiMiniDocumentCurrencyRupee style={{ color: "green" }} />
                <p style={{ color: "green" }}>Rentals</p>
              </div>

              <div
                style={{
                  backgroundColor: "grey",
                  width: "100px",
                  height: "10px",
                  position: "fixed",
                  bottom: 76,
                  marginLeft: "-32px",
                  backgroundColor: "rgb(248, 249, 250)",
                  borderTop: "0.5px solid rgb(227, 225, 225)",
                  borderLeft: "0.5px solid rgb(227, 225, 225)",
                  borderRight: "0.5px solid rgb(227, 225, 225)",
                  borderRadius: "50px 50px 0 0",
                }}
              ></div>
            </div>
            <div className="bn-item" onClick={() => navigate("/admin-tenants")}>
              <FaUsers />
              <p>Tenants</p>
            </div>
            <div className="bn-item" onClick={() => navigate("/my-profile")}>
              <FaUser />
              <p>Profile</p>
            </div>
          </>
        ) : (
          <>
            <div
              style={
                location.pathname === "/my-rents"
                  ? {
                      marginTop: "-12px",
                      fontSize: "30px",
                      color: "cornflowerblue",
                    }
                  : {
                      cursor: "pointer",
                    }
              }
              className="bn-item"
              onClick={() => navigate("/my-rents")}
            >
              <HiMiniDocumentCurrencyRupee />
              <p>Rents</p>
              {location.pathname === "/my-rents" ? (
                <div
                  style={{
                    backgroundColor: "grey",
                    width: "100px",
                    height: "10px",
                    position: "fixed",
                    bottom: 76,
                    marginLeft: "-35px",
                    backgroundColor: "rgb(248, 249, 250)",
                    borderTop: "0.5px solid rgb(227, 225, 225)",
                    borderLeft: "0.5px solid rgb(227, 225, 225)",
                    borderRight: "0.5px solid rgb(227, 225, 225)",
                    borderRadius: "50px 50px 0 0",
                  }}
                ></div>
              ) : null}
            </div>
            <div
              className="bn-item"
              onClick={() => navigate("/add-rent")}
              style={
                location.pathname === "/add-rent"
                  ? {
                      marginTop: "-12px",
                      fontSize: "30px",
                      color: "cornflowerblue",
                    }
                  : {
                      cursor: "pointer",
                    } // or whatever default
              }
            >
              <MdAddBox />
              <p>New</p>

              {location.pathname === "/add-rent" ? (
                <div
                  style={{
                    backgroundColor: "grey",
                    width: "100px",
                    height: "10px",
                    position: "fixed",
                    bottom: 76,
                    marginLeft: "-35px",
                    backgroundColor: "rgb(248, 249, 250)",
                    borderTop: "0.5px solid rgb(227, 225, 225)",
                    borderLeft: "0.5px solid rgb(227, 225, 225)",
                    borderRight: "0.5px solid rgb(227, 225, 225)",
                    borderRadius: "50px 50px 0 0",
                  }}
                ></div>
              ) : null}
            </div>
            <div
              className="bn-item"
              style={
                location.pathname === "/my-profile"
                  ? {
                      marginTop: "-12px",
                      fontSize: "30px",
                      color: "cornflowerblue",
                    }
                  : {
                      cursor: "pointer",
                    } // or whatever default
              }
              onClick={() => navigate("/my-profile")}
            >
              <FaUser style={{ fontSize: "21px" }} />
              <p>Profile</p>
              {location.pathname === "/my-profile" ? (
                <div
                  style={{
                    backgroundColor: "grey",
                    width: "100px",
                    height: "10px",
                    position: "fixed",
                    bottom: 76,
                    marginLeft: "-35px",
                    backgroundColor: "rgb(248, 249, 250)",
                    borderTop: "0.5px solid rgb(227, 225, 225)",
                    borderLeft: "0.5px solid rgb(227, 225, 225)",
                    borderRight: "0.5px solid rgb(227, 225, 225)",
                    borderRadius: "50px 50px 0 0",
                  }}
                ></div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default BottomNavbar;
