import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { CiMenuKebab } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

function Rents() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTenantsAndPayments = async () => {
      setLoading(true);

      // 1️⃣ Fetch tenants with asset details
      const { data: tenantData, error: tenantError } = await supabase
        .from("Tenants")
        .select(
          `
            id,
            tenant_name,
            gender,
            contact,
            address,
            final_rent,
            id_file_front,
            created_at,
            asset_id,
            Assets (asset_name)
          `
        )
        .order("created_at", { ascending: false });

      if (tenantError) {
        console.error("Error fetching tenants:", tenantError);
        setLoading(false);
        return;
      }

      const tenantsFormatted = tenantData.map((t) => ({
        ...t,
        asset_name: t.Assets?.asset_name || "—",
      }));

      // 2️⃣ Fetch last payment for each tenant
      const tenantIds = tenantsFormatted.map((t) => t.id);
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("RentPayments")
        .select("tenant_id, amount, paymentdate")
        .in("tenant_id", tenantIds)
        .order("paymentdate", { ascending: false });

      if (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
      }

      // 3️⃣ Merge last payment per tenant
      const latestPayments = {};
      paymentsData?.forEach((p) => {
        if (!latestPayments[p.tenant_id]) {
          latestPayments[p.tenant_id] = p; // first one is latest due to ordering
        }
      });

      const mergedData = tenantsFormatted.map((t) => ({
        ...t,
        last_payment: latestPayments[t.id] || null,
      }));

      setTenants(mergedData);
      setLoading(false);
    };

    fetchTenantsAndPayments();
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
      <h5 className="section-title mb-2">Rents</h5>
      <div className="row">
        {tenants.map((tenant) => {
          const payment = tenant.last_payment;
          const paymentText = payment
            ? `₹${payment.amount} | ${new Date(
                payment.paymentdate
              ).toLocaleDateString("en-IN")}`
            : "No payments yet";

          return (
            <div className="col-lg-4">
              <div
                className="card p-3 pb-2 mb-2 position-relative"
                key={tenant.id}
              >
                <CiMenuKebab
                  style={{ position: "absolute", top: 10, right: 10 }}
                />

                <div className="d-flex gap-2">
                  <img
                    style={{ width: "70px" }}
                    src="https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small_2x/Basic_Ui__28186_29.jpg"
                    className="img-fluid"
                    alt="tenant"
                  />
                  <div>
                    <b>
                      {tenant.tenant_name} <i>({tenant.asset_name})</i>
                    </b>
                    <p className="mb-0">
                      Monthly Rent - <b>₹{tenant.final_rent}</b>
                    </p>
                    <p className="mb-2">
                      Last Rent Paid -{" "}
                      <b style={{ color: "red" }}>{paymentText}</b>
                    </p>
                  </div>
                </div>

                <div>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/rent-details/${tenant?.id}`)}
                    size="small"
                  >
                    Payment History
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() =>
                      navigate("/add-rents", {
                        state: {
                          tenant,
                          lastPaymentDate:
                            tenant.last_payment?.paymentdate || null, // ✅ pass last payment date
                        },
                      })
                    }
                    className="ms-2"
                  >
                    Add Rent
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Rents;
