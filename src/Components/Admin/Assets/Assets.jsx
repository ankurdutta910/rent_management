import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import {
  Box,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import assetImg from "../../assets/img/asset.webp";
import { CiMenuKebab } from "react-icons/ci";
import { CiSquarePlus } from "react-icons/ci";
import { ToastContainer } from "react-toastify";
function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuAssetId, setMenuAssetId] = useState(null);

  const [editAssetModal, setEditAssetModal] = useState(false);
  const [meterModal, setMeterModal] = useState(false);

  const [editForm, setEditForm] = useState({
    id: null,
    asset_name: "",
    default_rent: "",
    description: "",
  });

  const [meterForm, setMeterForm] = useState({
    id: null,
    meterreading: "",
    readingupdated: "",
  });

  const navigate = useNavigate();

  const options = ["Update", "Meter Reading"];
  const ITEM_HEIGHT = 48;

  // Fetch Assets
  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("Assets")
        .select(
          `
          id,
          asset_name,
          default_rent,
          description,
          status,
          meterreading,
          readingupdated
        `
        )
        .order("asset_name", { ascending: true });

      if (!error) setAssets(data);
      setLoading(false);
    };

    fetchAssets();
  }, []);

  // Menu open
  const handleMenuClick = (event, assetId) => {
    setAnchorEl(event.currentTarget);
    setMenuAssetId(assetId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuAssetId(null);
  };

  // Handle menu item click
  const handleMenuSelect = (option) => {
    const asset = assets.find((a) => a.id === menuAssetId);
    handleMenuClose();

    if (option === "Update") {
      setEditForm({
        id: asset.id,
        asset_name: asset.asset_name,
        default_rent: asset.default_rent,
        description: asset.description,
      });
      setEditAssetModal(true);
    }

    if (option === "Meter Reading") {
      setMeterForm({
        id: asset.id,
        meterreading: asset.meterreading,
        readingupdated: new Date().toISOString(), // auto-set
      });
      setMeterModal(true);
    }
  };

  // Save edited asset
  const saveAssetEdit = async () => {
    const { error } = await supabase
      .from("Assets")
      .update({
        asset_name: editForm.asset_name,
        default_rent: editForm.default_rent,
        description: editForm.description,
      })
      .eq("id", editForm.id);

    if (!error) {
      setAssets((prev) =>
        prev.map((a) => (a.id === editForm.id ? { ...a, ...editForm } : a))
      );
      setEditAssetModal(false);
    }
  };

  // Save meter reading update
  const saveMeterUpdate = async () => {
    const { error } = await supabase
      .from("Assets")
      .update({
        meterreading: meterForm.meterreading,
        readingupdated: meterForm.readingupdated,
      })
      .eq("id", meterForm.id);

    if (!error) {
      setAssets((prev) =>
        prev.map((a) => (a.id === meterForm.id ? { ...a, ...meterForm } : a))
      );
      setMeterModal(false);
    }
  };

  const formatDate = (dateString, withTime = false) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    if (!withTime) {
      // Only Date
      return `${day}-${month}-${year}`;
    }

    // Date + Time
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  };

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
    <>
      <ToastContainer />
      <div className="container main">
        <div className="d-flex justify-content-between">
          <h5 className="section-title mb-2">Assets</h5>
          <Link className="mt-1" style={{ cursor: "pointer" }} to="/add-asset">
            <CiSquarePlus style={{ fontSize: "20px", marginTop: "-3px" }} /> Add
            Asset
          </Link>
        </div>
        <div className="row">
          {assets.map((asset) => (
            <div className="col-sm-4 mb-2" key={asset.id}>
              <div className="card p-2 position-relative">
                <CiMenuKebab
                  onClick={(e) => handleMenuClick(e, asset.id)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    cursor: "pointer",
                  }}
                />

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && menuAssetId === asset.id}
                  onClose={handleMenuClose}
                  PaperProps={{
                    style: { maxHeight: ITEM_HEIGHT * 4.5, width: "20ch" },
                  }}
                >
                  {options.map((option) => (
                    <MenuItem
                      key={option}
                      onClick={() => handleMenuSelect(option)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Menu>

                <div className="d-flex gap-2">
                  <img
                    style={{
                      width: "70px",
                      height: "70px",
                      objectFit: "cover",
                      borderRadius: "5px",
                    }}
                    src={assetImg}
                    className="img-fluid"
                    alt="asset"
                  />
                  <div>
                    <p className="mb-0">
                      <b>{asset.asset_name}</b> ({asset.description})
                    </p>
                    <p className="mb-0">Rent: ₹{asset.default_rent}</p>
                    <p className="mb-0">
                      Reading:{" "}
                      <b>
                        {asset.meterreading} |{" "}
                        {formatDate(asset.readingupdated)}
                      </b>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* -------------------- EDIT ASSET MODAL -------------------- */}
        <Dialog open={editAssetModal} onClose={() => setEditAssetModal(false)}>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              label="Asset Name"
              value={editForm.asset_name}
              onChange={(e) =>
                setEditForm({ ...editForm, asset_name: e.target.value })
              }
            />
            <TextField
              label="Default Rent"
              type="number"
              value={editForm.default_rent}
              onChange={(e) =>
                setEditForm({ ...editForm, default_rent: e.target.value })
              }
            />
            <TextField
              label="Description"
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setEditAssetModal(false)}>Cancel</Button>
            <Button onClick={saveAssetEdit} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* -------------------- METER READING MODAL -------------------- */}
        <Dialog open={meterModal} onClose={() => setMeterModal(false)}>
          <DialogTitle>Update Meter Reading</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              label="Meter Reading"
              type="number"
              value={meterForm.meterreading}
              onChange={(e) =>
                setMeterForm({ ...meterForm, meterreading: e.target.value })
              }
            />

            <TextField
              label="Reading Updated"
              value={meterForm.readingupdated}
              disabled
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setMeterModal(false)}>Cancel</Button>
            <Button onClick={saveMeterUpdate} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}

export default Assets;
