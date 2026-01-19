import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import { Box, Typography, CircularProgress } from "@mui/material";
import { FaPhone } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { CiSquarePlus } from "react-icons/ci";
import boy from "../../assets/img/boy.webp";
import girl from "../../assets/img/girl.webp";
import img from "../../assets/img/photo.webp";

function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  // Fetch tenants with asset details
  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("Tenants")
        .select(
          `
          id,
          tenant_name,
          gender,
          contact,
          address,
          final_rent,
          created_at,
          asset_id,userid,
          Assets (asset_name)
        `
        )
        .order("tenant_name", { ascending: true });

      if (error) {
        console.error("Error fetching tenants:", error);
      } else {
        const formattedData = data.map((t) => ({
          ...t,
          asset_name: t.Assets?.asset_name || "—",
        }));
        setTenants(formattedData);
      }
      setLoading(false);
    };

    fetchTenants();
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

  if (tenants.length === 0)
    return (
      <Typography variant="h6" align="center" mt={4}>
        No tenants found.
      </Typography>
    );

  return (
    <div className="container main">
      <div className="d-flex justify-content-between">
        <h5 className="section-title mb-2">Tenants</h5>
        <Link className="mt-1" style={{ cursor: "pointer" }} to="/add-tenant">
          <CiSquarePlus style={{ fontSize: "20px", marginTop: "-3px" }} /> Add
          Tenant
        </Link>
      </div>
      <div className="row">
        {tenants &&
          tenants.map((tenant) => (
            <div className="col-sm-4 mb-2" key={tenant.id}>
              <div
                className="card p-2 position-relative"
                style={{ cursor: "pointer" }}
                key={tenant.id}
                onClick={() => navigate(`/tenant-details/${tenant.id}`)}
              >
                {/* <CiMenuKebab
                  style={{ position: "absolute", top: 10, right: 10 }}
                /> */}

                <div className="d-flex gap-2">
                  <img
                    style={{ width: "60px" }}
                    src={
                      tenant.gender == "Male"
                        ? boy
                        : tenant.gender == "Female"
                        ? girl
                        : img
                    }
                    className="img-fluid"
                    alt="tenant"
                  />
                  <div>
                    <p className="mb-0 mt-0">
                      ID: {tenant.userid?.substring(0, 8).toUpperCase()}
                    </p>
                    <b>
                      {tenant.tenant_name} <i>({tenant.asset_name})</i>
                    </b>
                    <p className="mb-0">
                      <FaPhone
                        style={{
                          fontSize: "10px",
                          marginTop: "-2px",
                          color: "green",
                        }}
                      />{" "}
                      +91 {tenant.contact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Tenants;
