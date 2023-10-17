import React, { useState, useRef, useContext } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, InputBase, Paper, Typography, Snackbar, Alert } from "@mui/material";

import { BuildJsonContext } from "../../contexts/BuildJsonContext";
import TableComponent from "../../components/TableComponent";
import ConfirmDialog from "../../../../../common/ConfirmDialog";

const inlineFormStyles = {
    display: "flex",
    gap: "8px",
};

const SubFieldParameter = ({ selectedField, selectedNestedField }) => {
    const [subField, setSubField] = useState<string>("");
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [snackBaropen, setSnackBaropen] = useState<boolean>(false);
    const [messageInfo, setMessageInfo] = useState<any>();
    const gridRef = useRef<any>(null);
    const { manageFieldsScreenJson, selectedSubFieldsData } = useContext(BuildJsonContext);
    const nestedKey = selectedNestedField || selectedField;
    const columns = [
        { field: "subFieldValue", headerName: "Subfield", flex: 1, editable: false, sortable: false },
        {
            field: "action",
            headerName: "Action",
            cellRenderer: DeleteIcon,
        },
    ];

    const handleSubfield = () => {
        const isPresent = selectedSubFieldsData.some((item) => item.subFieldValue === subField);
        if (!isPresent) {
            manageFieldsScreenJson?.({
                type: "addSubField",
                payload: {
                    id: subField,
                    subFieldValue: subField,
                    subFieldName: "sub_fields",
                    fieldName: selectedField,
                    nestedKey: selectedNestedField || selectedField,
                    isArray: true,
                },
            });
            setSnackBaropen(true);
            setMessageInfo({ message: `Sub Field ${subField} Added`, severity: "success" });
            setSubField("");
        } else {
            setSnackBaropen(true);
            setMessageInfo({ message: `Sub Field Already Exists`, severity: "error" });
        }
    };
    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackBaropen(false);
    };

    const onCellClicked = (params) => {
        if (params.column.colId === "action") {
            setSubField(params.data.id);
            setConfirmOpen(true);
        }
    };
    function deleteRecord() {
        manageFieldsScreenJson?.({ type: "removeSubField", payload: subField });
        setSnackBaropen(true);
        setMessageInfo({ message: `Sub Field Deleted`, severity: "error" });
    }

    return (
        <>
            <div style={inlineFormStyles}>
                <Typography sx={{ color: "#8E8D8D", fontSize: "15px", display: "flex", alignItems: "center" }}>
                    Sub field
                </Typography>
                <Paper component="div" className="dalSearchInput">
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder=""
                        inputProps={{ "aria-label": "Add Sub Fields" }}
                        value={subField}
                        onChange={(e) => setSubField(e.target.value)}
                    />
                </Paper>
                <Button color="secondary" variant="outlined" onClick={() => handleSubfield()}>
                    Add Subfield
                </Button>
            </div>
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
                Are you sure you want to delete the <b>{selectedField}</b> Field?
            </ConfirmDialog>
            <TableComponent
                gridRef={gridRef}
                rowData={selectedSubFieldsData.filter(
                    (item) => item.fieldName === selectedField && item.nestedKey === nestedKey
                )}
                columnData={columns}
                onCellClicked={onCellClicked}
            />
        </>
    );
};

export default SubFieldParameter;
