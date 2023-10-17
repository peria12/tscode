import React, { useState, useContext, useRef } from "react";
import { Button, InputBase, Paper, Typography, Snackbar, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import TableComponent from "../../components/TableComponent";
import ConfirmDialog from "../../../../../common/ConfirmDialog";
import { BuildJsonContext } from "../../contexts/BuildJsonContext";
import { isJsonString } from "../../utils/common";

const OthersParameters = ({ selectedField }) => {
    const [keyValue, setKeyValue] = useState<any>({ key: "", value: "" });
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [snackBaropen, setSnackBaropen] = useState<boolean>(false);
    const [messageInfo, setMessageInfo] = useState<any>();
    const [selectedOthers, setSelectedOthers] = useState<string>("");
    const gridRef = useRef<any>(null);
    const { manageFieldsScreenJson, selectedOthersData } = useContext(BuildJsonContext);

    const update = (event) => {
        const { name, value } = event.target;
        setKeyValue((prev) => {
            return { ...prev, [name]: value };
        });
    };
    const submitHandler = () => {
        setKeyValue(keyValue);
        if (keyValue.value.trim() == "" || keyValue.key.trim() == "") {
            setSnackBaropen(true);
            setMessageInfo({ message: `Key & Value should not be empty`, severity: "error" });
        } else {
            setSnackBaropen(false);
            const isPresent = selectedOthersData.some((item) => item.subFieldName === keyValue.key);
            if (!isPresent) {
                manageFieldsScreenJson?.({
                    type: "addOthers",
                    payload: {
                        subFieldValue: isJsonString(keyValue.value) ? JSON.parse(keyValue.value) : keyValue.value,
                        subFieldName: keyValue.key,
                        fieldName: selectedField,
                        nestedKey: selectedField,
                        subFieldObjKey: keyValue.key,
                    },
                });
                setKeyValue({ key: "", value: "" });
                setSnackBaropen(true);
                setMessageInfo({ message: `Others Added`, severity: "success" });
            } else {
                setSnackBaropen(true);
                setMessageInfo({ message: `Others Key Already Exists`, severity: "error" });
            }
        }
    };

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackBaropen(false);
    };
    const onCellClicked = (params) => {
        console.log(params);
        if (params.column.colId === "action") {
            setSelectedOthers(params.data.id);
            setConfirmOpen(true);
        }
    };
    function deleteRecord() {
        manageFieldsScreenJson?.({ type: "removeOthers", payload: selectedOthers });
        setSnackBaropen(true);
        setMessageInfo({ message: `Others ${selectedOthers} Deleted`, severity: "error" });
    }
    const columns = [
        { field: "id", headerName: "Key", flex: 1, editable: false, sortable: false },
        { field: "value", headerName: "Values", flex: 1, editable: false, sortable: false },
        {
            field: "action",
            headerName: "Action",
            cellRenderer: DeleteIcon,
        },
    ];

    let formatOthers: any = [];
    function formatOthersData() {
        [...selectedOthersData].forEach((item) => {
            formatOthers = [...formatOthers, { id: item.subFieldName, value: item.subFieldValue }];
        });
        return formatOthers;
    }

    return (
        <>
            <div className="othersTab">
                <Typography>Key</Typography>
                <Paper component="div" className="dalSearchInput">
                    <InputBase
                        name="key"
                        onChange={update}
                        inputProps={{ "aria-label": "Add key" }}
                        value={keyValue.key}
                    />
                </Paper>
                <Typography>Value</Typography>
                <Paper component="div" className="dalSearchInput">
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        name="value"
                        onChange={update}
                        inputProps={{ "aria-label": "Add value" }}
                        value={keyValue.value}
                    />
                </Paper>
                <Button color="secondary" variant="outlined" onClick={submitHandler}>
                    Add Key Value
                </Button>
            </div>
            <TableComponent
                gridRef={gridRef}
                rowData={formatOthersData()}
                columnData={columns}
                onCellClicked={onCellClicked}
            />

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
                Are you sure you want to delete the <b>{selectedOthers}</b> Field?
            </ConfirmDialog>
        </>
    );
};

export default OthersParameters;
