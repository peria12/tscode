import React, { useEffect, useState, useMemo, useCallback, useContext, useRef } from "react";
import { Box, Alert, InputBase, Paper, Snackbar } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDialog from "../../../../../common/ConfirmDialog";
import Api from "utils/api";

import { BuildJsonContext } from "../../contexts/BuildJsonContext";
import { RowDoubleClickedEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const SearchTab = () => {
    const [snackBaropen, setSnackBaropen] = useState<boolean>(false);
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [selectedEntity, setSelectedEntity] = useState<any>();
    const [filteredEntity, setFilteredEntity] = useState<any>([]);
    const [messageInfo, setMessageInfo] = useState<any>();
    const [searchValue, setSearchValue] = useState<string>("");
    const [filterData, setFilterData] = useState<any>([]);
    const gridRef = useRef<any>(null);
    const gridStyle = useMemo(() => ({ marginTop: "20px", height: "240px", width: "100%" }), []);
    const { manageEntityScreenJson, selectedEntityData } = useContext(BuildJsonContext);
    useEffect(() => {
        if (searchValue.trim().length <= 2) {
            setFilterData([]);
        } else {
            gridRef.current.api.showLoadingOverlay();
            Api.getEntities({
                page_size: 30,
                is_active: true,
                search_string: searchValue,
            })
                .then((res) => {
                    const data = res.entities.map(({ entity_id: entityID, entity_name: entityName }) => ({
                        id: entityID,
                        entity_id: entityID,
                        entity_name: entityName,
                    }));
                    setFilterData(data);
                    gridRef.current.api.hideOverlay();
                })
                .catch((e) => {
                    console.log(e);
                });
        }
    }, [searchValue]);

    useEffect(() => {
        let filteredData: any = [];
        selectedEntityData.forEach((item: any) => {
            if (typeof item !== "object") filteredData = [...filteredData, { id: item, rowID: item }];
        });
        setFilteredEntity(filteredData);
    }, [selectedEntityData]);
    const defaultColDef = useMemo(() => {
        return {
            enableValue: true,
            width: 100,
            resizable: true,
            flex: 1,
            minWidth: 100,
            suppressMenu: true,
        };
    }, []);

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackBaropen(false);
    };
    const handleSearchFieldOnChange = (e) => {
        setSearchValue(e.target.value.toLowerCase());
    };
    const columns = [
        { field: "entity_id", headerName: "Entities", maxWidth: 250 },
        { field: "entity_name", headerName: "Description" },
    ];
    const selectedEntityColumns = [
        { field: "rowID", headerName: "Entities" },
        { field: "entity_name", headerName: "Values" },
        {
            field: "action",
            headerName: "Action",
            cellRenderer: DeleteIcon,
        },
    ];
    const onRowDoubleClicked = useCallback(
        (event: RowDoubleClickedEvent) => {
            const test = event.api.getSelectedNodes();
            if (!selectedEntityData.includes(test[0].data.id)) {
                manageEntityScreenJson?.({ type: "addSearchEntity", payload: test[0].data.id });
                setSnackBaropen(true);
                setMessageInfo({ message: `Entity ${test[0].data.id} Added`, severity: "success" });
            } else {
                setMessageInfo({ message: `Entity Already Exists`, severity: "error" });
            }
        },
        [selectedEntityData, manageEntityScreenJson]
    );

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
    return (
        <>
            <Box sx={{ padding: 0, height: 280, width: "100%" }}>
                <Paper component="div" className="dalSearchInput">
                    <InputBase
                        sx={{ ml: 1, flex: 2 }}
                        placeholder="Search Entities"
                        inputProps={{ "aria-label": "Search Entities" }}
                        value={searchValue}
                        onChange={handleSearchFieldOnChange}
                    />
                    <SearchIcon sx={{ margin: "4px 5px 0 0" }} color="action" />
                </Paper>
                <div style={gridStyle} className="ag-theme-balham">
                    <AgGridReact
                        ref={gridRef}
                        rowData={filterData}
                        columnDefs={columns}
                        defaultColDef={defaultColDef}
                        rowSelection={"single"}
                        onRowDoubleClicked={onRowDoubleClicked}
                    />
                </div>
            </Box>
            <Box sx={{ padding: "24px 0px", height: 250, width: "100%" }}>
                <div style={gridStyle} className="ag-theme-balham">
                    <AgGridReact
                        rowData={filteredEntity}
                        columnDefs={selectedEntityColumns}
                        defaultColDef={defaultColDef}
                        onCellClicked={onCellClicked}
                    />
                </div>
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
        </>
    );
};

export default SearchTab;
