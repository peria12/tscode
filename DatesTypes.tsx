import React, { useContext } from "react";
import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { BuildJsonContext } from "../../contexts/BuildJsonContext";
const DatesTypes = () => {
    const { manageDatesScreenJson, selectedDatesType } = useContext(BuildJsonContext);

    const handleDatesType = (event, newDateType) => {
        manageDatesScreenJson?.({ type: "addSelectedDatesTypes", payload: newDateType });
    };

    return (
        <>
            <Typography
                sx={{ color: "#8E8D8D", fontSize: "15px", display: "flex", marginRight: "16px", alignItems: "center" }}
            >
                Date Type
            </Typography>
            <ToggleButtonGroup
                color="secondary"
                value={selectedDatesType}
                exclusive
                onChange={handleDatesType}
                aria-label="text alignment"
                sx={{ height: 45, marginTop: "20px" }}
            >
                <ToggleButton value="series" aria-label="Series">
                    Series
                </ToggleButton>
                <ToggleButton value="snapshots" aria-label="Snapshots">
                    Snapshots
                </ToggleButton>
                <ToggleButton value="range" aria-label="Range">
                    Range
                </ToggleButton>
            </ToggleButtonGroup>
        </>
    );
};

export default DatesTypes;
