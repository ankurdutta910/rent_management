import React, { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./supabase";
import AddAsset from "./Components/Admin/Assets/AddAsset";
import Navbar from "./Components/Navbar";
import Login from "./Components/Login";
import { Navigate, Route, Routes } from "react-router-dom";
import AddTenant from "./Components/Admin/Tenants/AddTenant";
import Tenants from "./Components/Admin/Tenants/Tenants";
import Assets from "./Components/Admin/Assets/Assets";
import Rents from "./Components/Admin/Rentals/Rents";
import AddRent from "./Components/Admin/Rentals/AddRent";
import MyRents from "./Components/Users/MyRents";
import TeanantAddRent from "./Components/Users/AddRent";
import { Box, CircularProgress } from "@mui/material";
import Receipt from "./Components/Users/Receipt";
import Dashboard from "./Components/Dashboard";
import BottomNavbar from "./Components/BottomNavbar";
import MyProfile from "./Components/Users/MyProfile";
import UploadID from "./Components/Users/UploadID";
import Download from "./Components/Download";
import GenarateUser from "./Components/GenarateUser";
import TermsCondition from "./Components/Users/TermsCondition";
import PrivacyPolicy from "./Components/PrivacyPolicy";
import Feedback from "./Components/Users/Feedback";
import ResetPassword from "./Components/ResetPassword";
import RentalDetails from "./Components/Admin/Rentals/RentalDetails";
import EditRent from "./Components/Admin/Rentals/EditRent";
import TenantDetails from "./Components/Admin/Tenants/TenantDetails";
import HealthInsurance from "./Components//HealthInsurance";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Session error:", error.message);
      setSession(data?.session);
      setLoading(false);
    };

    getSession();

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <CircularProgress />
      </Box>
    );

  return (
    <div className="App">
      <Routes>
        <Route path="/downloadapk" element={<Download />} />
        <Route path="/genarate-userid" element={<GenarateUser />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms&conditions" element={<TermsCondition />} />

        {/* If logged in → Dashboard, else → Login */}
        <Route
          path="/"
          element={
            session ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/add-tenant"
          element={
            <>
              <Navbar />
              <AddTenant />
              <BottomNavbar />
            </>
          }
        />

        <Route
          path="/admin-tenants"
          element={
            session ? (
              <>
                <Navbar />
                <Tenants />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/tenant-details/:id"
          element={
            session ? (
              <>
                <Navbar />
                <TenantDetails />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/add-asset"
          element={
            <>
              <Navbar />
              <AddAsset />
              <BottomNavbar />
            </>
          }
        />

        <Route
          path="/admin-assets"
          element={
            session ? (
              <>
                <Navbar />
                <Assets />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin-rentals"
          element={
            session ? (
              <>
                <Navbar />
                <Rents />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/rent-details/:id"
          element={
            session ? (
              <>
                <Navbar />
                <RentalDetails />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/add-rents"
          element={
            session ? (
              <>
                <Navbar />
                <AddRent />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/edit-rent/:id"
          element={
            session ? (
              <>
                <Navbar />
                <EditRent />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* ///Userss */}

        <Route
          path="/health-insurance"
          element={
            session ? (
              <>
                <Navbar />
                <HealthInsurance />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/my-profile"
          element={
            session ? (
              <>
                <Navbar />
                <MyProfile />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/submit-feedback"
          element={
            session ? (
              <>
                <Navbar />
                <Feedback />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/my-rents"
          element={
            session ? (
              <>
                <Navbar />
                <MyRents />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/add-rent"
          element={
            session ? (
              <>
                <Navbar />
                <TeanantAddRent />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/upload-id"
          element={
            session ? (
              <>
                <Navbar />
                <UploadID />
                <BottomNavbar />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/receipt"
          element={
            session ? (
              <>
                <Navbar />
                <Receipt />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* ///Userss */}

        <Route
          path="/login"
          element={
            <>
              <Login />
            </>
          }
        />

        <Route
          path="/reset-password"
          element={
            <>
              <ResetPassword />
            </>
          }
        />

        <Route
          path="/dashboard"
          element={
            <>
              <Navbar />
              <Dashboard />
              <BottomNavbar />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
