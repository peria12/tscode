import React, { useState, useContext } from "react";
import { Button, Box, CardContent, Typography, TextField, FormGroup, Snackbar, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import TableComponent from "../../components/TableComponent";
import ConfirmDialog from "../../../../../common/ConfirmDialog";
import DatesTypes from "./DatesTypes";
import DatesTypesFilter from "./DatesTypesFilter";
import { isValid_Date } from "../../utils/common";

import { BuildJsonContext } from "../../contexts/BuildJsonContext";

const DatesContainer = () => {
    const [selectedDate, setSelectedDate] = useState<any>(null);
    const [multipleDates, setMultipleDates] = useState<string>("");
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [snackBaropen, setSnackBaropen] = useState<boolean>(false);
    const [messageInfo, setMessageInfo] = useState<any>();
    const [deleteDate, setDeleteDate] = useState<any>("");
    const { manageDatesScreenJson, selectedDatesData, isFromDalPlugin } = useContext(BuildJsonContext);

    const handleAddDate = () => {
        const formatDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 10);
        console.log(formatDate, "formatDate");
        if (!selectedDatesData.includes(formatDate)) {
            setSnackBaropen(true);
            setMessageInfo({ message: `Date Value Added`, severity: "success" });
            manageDatesScreenJson?.({ type: "addSelectedDate", payload: formatDate });
        } else {
            setSnackBaropen(true);
            setMessageInfo({ message: `Date Already Exists`, severity: "error" });
        }
    };

    const handleOnChange = (e) => {
        setMultipleDates(e.target.value);
    };

    const addDateArray = (data) => {
        const datesarray = data.split(",");
        const isDatesValid = datesarray.filter((item) => !isValid_Date(item));
        const isUnique = datesarray.filter((item) => selectedDatesData.includes(item));
        if (isDatesValid.length !== 0) {
            setSnackBaropen(true);
            setMessageInfo({ message: `Date Format is not valid`, severity: "error" });
        } else {
            if (isUnique.length === 0) {
                manageDatesScreenJson?.({ type: "addSelectedDate", payload: datesarray });
                setMultipleDates("");
                setSnackBaropen(true);
                setMessageInfo({ message: `Date Value Added`, severity: "success" });
            } else {
                setSnackBaropen(true);
                setMessageInfo({ message: `Date Already Exists`, severity: "error" });
            }
        }
    };

    const postSelect = () => {
        if (isFromDalPlugin) {
            window.chrome.webview.postMessage(
                JSON.stringify({ message: "SelectFromExcel", data: null, calledfrom: "dates" })
            );
        } else {
            addDateArray(multipleDates);
        }
    };
    if (isFromDalPlugin) {
        window.chrome.webview.addEventListener("message", (event) => {
            const val = event.data;
            if (val.message === "SelectFromExcel" && val.calledfrom === "entities") {
                setMultipleDates(val.data);
                addDateArray(val.data);
            }
        });
    }
    const onCellClicked = (params) => {
        console.log(params);
        if (params.column.colId === "action") {
            setDeleteDate(params.data.id);
            setConfirmOpen(true);
        }
    };
    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackBaropen(false);
    };
    let formattedDate: any = [];
    function dateFormat() {
        selectedDatesData.forEach((item) => {
            formattedDate = [...formattedDate, { id: item, selectedDate: item }];
        });
        return formattedDate;
    }
    function deleteRecord() {
        manageDatesScreenJson?.({ type: "removeSelectedDate", payload: deleteDate });
        setSnackBaropen(true);
        setMessageInfo({ message: `Date ${deleteDate} Deleted`, severity: "error" });
    }
    const columns = [
        { field: "selectedDate", headerName: "Selected Dates", flex: 1, editable: false, sortable: false },
        {
            field: "action",
            headerName: "Action",
            cellRenderer: DeleteIcon,
        },
    ];
    return (
        <CardContent>
            <div style={{ display: "flex", gap: "12px" }}>
                <Typography sx={{ color: "#8E8D8D", fontSize: "15px", marginRight: "16px", marginTop: "9px" }}>
                    Date
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        disableFuture
                        inputFormat="yyyy-MM-dd"
                        value={selectedDate}
                        onChange={(newDateValue) => {
                            console.log(newDateValue, "newDateValue");
                            setSelectedDate(newDateValue);
                        }}
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
                <Button variant="outlined" color="secondary" onClick={handleAddDate}>
                    Add Dates
                </Button>
            </div>
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    display: "flex",
                    paddingBottom: "12px",
                }}
                className="datesScreen"
            >
                <div className="multidate">
                    <Typography sx={{ color: "#8E8D8D", width: "60px", fontSize: "15px", marginTop: "16px" }}>
                        Multiple Dates
                    </Typography>
                    <textarea id="datesScreenexcelvalues" value={multipleDates} onChange={handleOnChange} />
                    <Button className="selectValueBtn" variant="outlined" color="secondary" onClick={postSelect}>
                        {isFromDalPlugin ? "Select from Excel" : "submit"}
                    </Button>
                </div>
                <FormGroup sx={{ flexDirection: "row" }}>
                    <DatesTypes />
                </FormGroup>
            </Box>

            <Box sx={{ display: "flex" }}>
                <Box sx={{ flex: 2, marginRight: "10px", height: 350, width: "100%" }}>
                    <TableComponent
                        gridRef={null}
                        rowData={dateFormat()}
                        columnData={columns}
                        onCellClicked={onCellClicked}
                    />
                </Box>
                <DatesTypesFilter />
            </Box>
            <Snackbar open={snackBaropen} autoHideDuration={100000} onClose={handleClose}>
                <Alert variant="filled" onClose={handleClose} severity={messageInfo?.severity} sx={{ width: "100%" }}>
                    {messageInfo?.message}
                </Alert>
            </Snackbar>
            <ConfirmDialog
                title={`Delete?`}
                open={confirmOpen}
                setOpen={setConfirmOpen}
                stopPropagation={true}
                onConfirm={(e) => {
                    e?.stopPropagation();
                    deleteRecord();
                }}
            >
                Are you sure you want to delete the <b>{deleteDate}</b> Date?
            </ConfirmDialog>
        </CardContent>
    );
};

export default DatesContainer;
