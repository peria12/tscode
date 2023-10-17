import React, { useContext } from "react";
import { Typography, TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { BuildJsonContext } from "../../contexts/BuildJsonContext";

const IDDateComponent = () => {
    const { manageEntityScreenJson, selectedIDDateData } = useContext(BuildJsonContext);
    const dateHandler = (newDateValue) => {
        const formatDate = new Date(newDateValue.getTime() - newDateValue.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 10);
        manageEntityScreenJson?.({ type: "addSelectedIDDate", payload: formatDate });
    };
    return (
        <>
            <Typography>ID Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    disableFuture
                    inputFormat="yyyy-MM-dd"
                    value={selectedIDDateData}
                    onChange={dateHandler}
                    InputProps={{
                        sx: {
                            "&.MuiInputBase-root": {
                                "& .MuiOutlinedInput-input": {
                                    padding: "9px",
                                },
                            },
                        },
                    }}
                    renderInput={(params) => (
                        <TextField sx={{ "& legend": { display: "none" }, "& fieldset": { top: 0 } }} {...params} />
                    )}
                />
            </LocalizationProvider>
        </>
    );
};
export default IDDateComponent;
