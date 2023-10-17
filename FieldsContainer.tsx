import React, { useState, useContext, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Dialog, DialogContent, DialogTitle, Snackbar, Alert } from "@mui/material";
import AddFieldComponent from "../../components/AddFieldComponent";
import TableComponent from "../../components/TableComponent";
import ParametersContainer from "../ParameterTabs/ParametersContainer";
import ConfirmDialog from "../../../../../common/ConfirmDialog";
import { BuildJsonContext } from "../../contexts/BuildJsonContext";

const FieldsContainer = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [snackBaropen, setSnackBaropen] = useState<boolean>(false);
    const [searchFieldValue, setSearchFieldValue] = useState<any>({ id: "", label: "" });
    const [messageInfo, setMessageInfo] = useState<any>();
    const [selectedField, setSelectedField] = useState<string>("");
    const gridRef = useRef<any>(null);
    const { manageFieldsScreenJson, selectedFieldsData } = useContext(BuildJsonContext);

    const handleAddField = () => {
        const isPresent = selectedFieldsData.some((item) => item.id === searchFieldValue.id);
        if (!isPresent && searchFieldValue.id !== "") {
            manageFieldsScreenJson?.({ type: "addFields", payload: searchFieldValue });
            setSearchFieldValue({ id: "", label: "" });
            setSnackBaropen(true);
            setMessageInfo({ message: `Field ${searchFieldValue.id} Added`, severity: "success" });
        } else {
            setSnackBaropen(true);
            setMessageInfo({ message: `Field Already Exists`, severity: "error" });
        }
    };
    const handleSubFieldModal = () => {
        setIsOpen(false);
    };
    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackBaropen(false);
    };
    const onCellClicked = (params) => {
        if (params.column.colId === "parameters") {
            setSelectedField(params.data.id);
            setIsOpen(true);
            setSnackBaropen(false);
        }
        if (params.column.colId === "action") {
            setSelectedField(params.data.id);
            setConfirmOpen(true);
        }
    };
    function deleteRecord() {
        manageFieldsScreenJson?.({ type: "removeField", payload: selectedField });
        setSnackBaropen(true);
        setMessageInfo({ message: `Field Deleted`, severity: "error" });
    }
    const columns = [
        { field: "id", headerName: "Fields", maxWidth: 300 },
        {
            field: "parameters",
            headerName: "parameters",
            cellClass: "rag-amber",
            cellRenderer: () => {
                return (
                    <button
                        style={{
                            backgroundColor: "lightsalmon",
                            color: "#000000CC",
                            cursor: "pointer",
                            textAlign: "start",
                            border: "none",
                            width: "100%",
                        }}
                    >
                        Parameters
                    </button>
                );
            },
        },
        {
            field: "action",
            headerName: "Action",
            maxWidth: 150,
            cellRenderer: DeleteIcon,
        },
    ];
    return (
        <>
            <AddFieldComponent
                setSearchFieldValue={setSearchFieldValue}
                searchFieldValue={searchFieldValue}
                handleAddField={handleAddField}
                tableComponent={
                    <TableComponent
                        gridRef={gridRef}
                        rowData={selectedFieldsData}
                        columnData={columns}
                        onCellClicked={onCellClicked}
                    />
                }
            />
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="dal-web fields-pop-up">
                <DialogTitle>Parameter for {selectedField}</DialogTitle>
                <DialogContent>
                    <ParametersContainer
                        selectedField={selectedField}
                        handleSubFieldModal={handleSubFieldModal}
                        selectedNestedField={null}
                    />
                </DialogContent>
            </Dialog>
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
        </>
    );
};

export default FieldsContainer;
