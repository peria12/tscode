import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import { Button, InputBase, Paper, Typography, Snackbar, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import TableComponent from "../../components/TableComponent";
import ConfirmDialog from "../../../../../common/ConfirmDialog";
import { BuildJsonContext } from "../../contexts/BuildJsonContext";

const FiltersParameter = ({ selectedField }) => {
    const [filterIDType, setFilterIDType] = useState<string>("");
    const [filterInputId, setFilterInputId] = useState<string>("");
    const [filterIds, setFilterIds] = useState<any>([]);
    const [removefilterID, setRemovefilterID] = useState<string>("");
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [snackBaropen, setSnackBaropen] = useState<boolean>(false);
    const [messageInfo, setMessageInfo] = useState<any>();
    const gridRef = useRef<any>(null);
    const componentDidMount = useRef(false);
    const { selectedFilterData, setSelectedFilterData } = useContext(BuildJsonContext);

    useEffect(() => {
        if (!componentDidMount.current) {
            componentDidMount.current = true;
            const getFiltersByField = () => {
                const filterVal = selectedFilterData.filter((item) => item?.filterObj?.selectedField === selectedField);
                if (filterVal.length !== 0) {
                    setFilterIds(filterVal[0].filterObj.filter.ids);
                    setFilterIDType(filterVal[0].filterObj.filter.id_type);
                }
            };
            getFiltersByField();
        }
    }, [selectedFilterData, selectedField]);

    const addFiltersCallback = useCallback(() => {
        if (setSelectedFilterData)
            setSelectedFilterData((current) => [
                ...current.filter((x) => x.filterObj.selectedField !== selectedField),
                { filterObj: { selectedField: selectedField, filter: { id_type: filterIDType, ids: filterIds } } },
            ]);
    }, [filterIds, filterIDType, selectedField, setSelectedFilterData]);

    useEffect(() => {
        addFiltersCallback();
    }, [addFiltersCallback]);

    const handleAddFilterID = (event) => {
        const { name, value } = event.target;
        if (name === "filterIDType") {
            setFilterIDType(value);
        }
        if (name === "filterID") {
            setFilterInputId(value);
        }
    };

    const submitAddFilterId = () => {
        const isPresent = filterIds.some((item) => item === filterInputId);
        if (filterInputId !== "") {
            if (!isPresent) {
                setFilterIds((ids) => [...ids, filterInputId]);
                setSnackBaropen(true);
                setMessageInfo({ message: `Filter ID ${filterInputId} Added`, severity: "success" });
                setFilterInputId("");
            } else {
                setSnackBaropen(true);
                setMessageInfo({ message: `Filter ID Exists`, severity: "error" });
            }
        } else {
            setSnackBaropen(true);
            setMessageInfo({ message: `Filter ID is not valid`, severity: "error" });
        }
    };

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackBaropen(false);
    };

    let formatFilter: any = [];
    function formatFilterData() {
        filterIds.forEach((itemid) => {
            formatFilter = [...formatFilter, { id: itemid }];
        });
        return formatFilter;
    }
    const onCellClicked = (params) => {
        if (params.column.colId === "action") {
            setRemovefilterID(params.data.id);
            setConfirmOpen(true);
        }
    };

    function deleteRecord() {
        setFilterIds((oldValues) => {
            return oldValues.filter((item) => item !== removefilterID);
        });
        setSnackBaropen(true);
        setMessageInfo({ message: `Filter ID Deleted`, severity: "error" });
    }

    const columns = [
        { field: "id", headerName: "Filter IDs", flex: 1, editable: false, sortable: false },
        {
            field: "action",
            headerName: "Action",
            cellRenderer: DeleteIcon,
        },
    ];

    return (
        <>
            <div className="filtersTab">
                <Typography>ID Type</Typography>
                <Paper component="div" className="dalSearchInput">
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        name="filterIDType"
                        value={filterIDType}
                        onChange={handleAddFilterID}
                        inputProps={{ "aria-label": "Id Type" }}
                    />
                </Paper>
                <Typography>ID</Typography>
                <Paper component="div" className="dalSearchInput">
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        onChange={handleAddFilterID}
                        name="filterID"
                        value={filterInputId}
                        inputProps={{ "aria-label": "Id" }}
                    />
                </Paper>
                <Button color="secondary" variant="outlined" onClick={submitAddFilterId}>
                    Add Filter Id
                </Button>
            </div>
            <TableComponent
                gridRef={gridRef}
                rowData={formatFilterData()}
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
                Are you sure you want to delete the <b>{removefilterID}</b> Filter ID?
            </ConfirmDialog>
        </>
    );
};
export default FiltersParameter;
