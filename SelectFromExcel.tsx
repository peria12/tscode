import React, { useState, useEffect, useContext } from "react";
import { debounce, uniq } from "lodash";
import { Box, Button, CardContent, Paper, Typography, Snackbar, Alert } from "@mui/material";
import ConfirmDialog from "../../../../../common/ConfirmDialog";
import TableComponent from "../../components/TableComponent";
import DeleteIcon from "@mui/icons-material/Delete";
import { BuildJsonContext } from "../../contexts/BuildJsonContext";
import IDDateComponent from "./IDDateComponent";
import Api from "../../../../../utils/api";
import SearchInput from "../../../../../common/SearchInput";

const SelectFromExcelTab = () => {
    const [selectedexcelVal, setSelectedExcelVal] = useState<any>("");
    const [selectedEntity, setSelectedEntity] = useState<any>();
    const [snackBaropen, setSnackBaropen] = useState<boolean>(false);
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [messageInfo, setMessageInfo] = useState<any>();
    const [dalFieldsList, setDalFieldsList] = useState<any>();
    const [loading, setLoading] = useState<boolean>(false);
    const [searchFieldValue, setSearchFieldValue] = useState<any>({ id: "", label: "" });
    const [searchInputChange, setSearchInputChange] = useState<any>("");
    const { manageEntityScreenJson, selectedEntityData, setSelectedIDTypeData, isFromDalPlugin } =
        useContext(BuildJsonContext);

    const addMultipleEntities = (data) => {
        const arr = data.split(",");
        const isUnique = arr.filter((item) => selectedEntityData.includes(item));
        if (isUnique.length === 0) {
            manageEntityScreenJson?.({ type: "addSearchEntity", payload: arr });
            setSelectedExcelVal("");
            setSnackBaropen(true);
            setMessageInfo({ message: `Entities Added`, severity: "success" });
        } else {
            setSnackBaropen(true);
            setMessageInfo({ message: `Entity Already Exists`, severity: "error" });
        }
    };
    const postSelect = () => {
        if (isFromDalPlugin) {
            window.chrome.webview.postMessage(
                JSON.stringify({ message: "SelectFromExcel", data: null, calledfrom: "entities" })
            );
        } else {
            addMultipleEntities(selectedexcelVal);
        }
    };
    if (isFromDalPlugin) {
        window.chrome.webview.addEventListener("message", (event) => {
            const val = event.data;
            if (val.message === "SelectFromExcel" && val.calledfrom === "entities") {
                setSelectedExcelVal(val.data);
                addMultipleEntities(val.data);
            }
        });
    }
    const handleOnChange = (e) => {
        setSelectedExcelVal(e.target.value);
    };

    let filteredData: any = [];
    function EntityDataFormat() {
        selectedEntityData.forEach((item) => {
            if (typeof item !== "object") filteredData = [...filteredData, { id: item, rowID: item }];
        });
        return filteredData;
    }
    const selectedEntityColumns = [
        { field: "rowID", headerName: "Entities", flex: 1, editable: false, sortable: false },
        { field: "entity_name", headerName: "Values", flex: 1, editable: false, sortable: false },
        {
            field: "action",
            headerName: "Action",
            cellRenderer: DeleteIcon,
        },
    ];

    const onCellClicked = (params) => {
        if (params.column.colId === "action") {
            setSelectedEntity(params.data.id);
            setConfirmOpen(true);
        }
    };

    function deleteRecord() {
        manageEntityScreenJson?.({ type: "removeSearchEntity", payload: selectedEntity });
        setMessageInfo({ message: `Entity Deleted`, severity: "error" });
    }

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackBaropen(false);
    };
    useEffect(() => {
        debounceSearchInputChange(searchInputChange);
        return () => debounceSearchInputChange.cancel();
    }, [searchInputChange]);

    const updateQuery = (e, v) => setSearchInputChange(v);
    const debounceSearchInputChange = debounce(updateQuery, 400);

    useEffect(() => {
        if (searchInputChange != undefined && searchInputChange.length > 1) {
            setLoading(true);
            Api.getEntities({
                page_size: 30,
                is_active: true,
                search_string: searchInputChange,
            })
                .then((res) => {
                    console.log(res);
                    let data = res.entities.map((item) => Object.keys(item));
                    data = uniq(data.flat().sort()).map((item) => {
                        return { id: item, label: item };
                    });
                    setDalFieldsList(data);
                    setLoading(false);
                })
                .catch((e) => {
                    console.log(e);
                });
        }
    }, [searchInputChange]);
    return (
        <div className="selectFromExcelTab">
            <CardContent sx={{ padding: "0px" }}>
                <div style={{ display: "flex", gap: "13px" }}>
                    <Typography>ID Type</Typography>
                    <Paper
                        component="div"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            width: 280,
                            border: "1px solid #8E8E8E",
                            position: "relative",
                            boxShadow: "none",
                            height: "40px",
                            marginRight: "20px",
                        }}
                    >
                        <SearchInput
                            onChange={(_, v) => {
                                setSearchFieldValue(v);
                                setSelectedIDTypeData?.(v.id);
                            }}
                            onInputChange={debounceSearchInputChange}
                            options={dalFieldsList}
                            value={searchFieldValue}
                            placeholder="Search Entities"
                            popperWidth="300px"
                            searchIcon={true}
                            disableUnderline={true}
                        />
                        {loading && <span className="custom-loader"></span>}
                    </Paper>
                    <IDDateComponent />
                </div>
            </CardContent>
            <div style={{ display: "flex", gap: "8px" }}>
                <Typography className="addEntititesLabel">Add Entities</Typography>
                <textarea id="selectedexcelvalues" value={selectedexcelVal} onChange={handleOnChange} />
                <Button className="selectValueBtn" variant="outlined" color="secondary" onClick={postSelect}>
                    {isFromDalPlugin ? "Select from Excel" : "submit"}
                </Button>
            </div>
            <Box sx={{ padding: 0, height: 350, width: "100%" }}>
                <TableComponent
                    gridRef={null}
                    rowData={EntityDataFormat()}
                    columnData={selectedEntityColumns}
                    onCellClicked={onCellClicked}
                />
            </Box>
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
                Are you sure you want to delete the <b>{selectedEntity}</b> entity?
            </ConfirmDialog>
            <Snackbar open={snackBaropen} autoHideDuration={100000} onClose={handleClose}>
                <Alert variant="filled" onClose={handleClose} severity={messageInfo?.severity} sx={{ width: "100%" }}>
                    {messageInfo?.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default SelectFromExcelTab;
