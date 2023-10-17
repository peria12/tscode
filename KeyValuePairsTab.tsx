import React, { useState, useEffect, useContext, useRef } from "react";
import { Button, FormGroup, InputBase, Paper, Typography, Snackbar, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { debounce, uniq } from "lodash";
import SearchInput from "../../../../../common/SearchInput";
import TableComponent from "../../components/TableComponent";
import ConfirmDialog from "../../../../../common/ConfirmDialog";
import IDDateComponent from "./IDDateComponent";
import { BuildJsonContext } from "../../contexts/BuildJsonContext";
import Api from "../../../../../utils/api";

const KeyValuePairsTab = () => {
    const [keyValue, setKeyValue] = useState<any>({ value: "" });
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [snackBaropen, setSnackBaropen] = useState<boolean>(false);
    const [messageInfo, setMessageInfo] = useState<any>();
    const [searchFieldValue, setSearchFieldValue] = useState<any>({ id: "", label: "" });
    const [searchInputChange, setSearchInputChange] = useState<any>("");
    const [dalFieldsList, setDalFieldsList] = useState<any>();
    const [selectedKeyValue, setSelectedKeyValue] = useState<any>("");
    const gridRef = useRef<any>(null);
    const { manageEntityScreenJson, selectedEntityData } = useContext(BuildJsonContext);
    const update = (event) => {
        const { name, value } = event.target;
        setKeyValue((prev) => {
            return { ...prev, [name]: value };
        });
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

    const submitHandler = () => {
        setKeyValue(keyValue);
        if (keyValue.value.trim() == "" || searchFieldValue?.id.trim() == "") {
            setSnackBaropen(true);
            setMessageInfo({ message: `Key & Value should not be empty`, severity: "error" });
        } else {
            setSnackBaropen(false);
            const isPresent = selectedEntityData.filter((item) => {
                let keep = false;
                if (typeof item === "object") {
                    const val = Object.entries(item);
                    keep = val[0][0] === searchFieldValue?.id;
                }
                return keep;
            });
            if (isPresent.length === 0) {
                manageEntityScreenJson?.({
                    type: "addSearchEntity",
                    payload: { [searchFieldValue?.id]: keyValue.value },
                });
                setKeyValue({ value: "" });
                setSearchFieldValue({ id: "", label: "" });
                setSnackBaropen(true);
                setMessageInfo({ message: `Key Value Added`, severity: "success" });
            } else {
                setSnackBaropen(true);
                setMessageInfo({ message: `Key Already Exists`, severity: "error" });
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
            setSelectedKeyValue(params.data);
            setConfirmOpen(true);
        }
    };
    function deleteRecord() {
        manageEntityScreenJson?.({ type: "removeKeyValuePairs", payload: selectedKeyValue });
        setSnackBaropen(true);
        setMessageInfo({ message: `Key Value ${selectedKeyValue.value} Deleted`, severity: "error" });
    }
    const columns = [
        { field: "key", headerName: "Key", flex: 1, editable: false, sortable: false },
        { field: "value", headerName: "Values", flex: 1, editable: false, sortable: false },
        {
            field: "action",
            headerName: "Action",
            cellRenderer: DeleteIcon,
        },
    ];

    const filteredObjData: any = [];
    function entityDataObjFormat() {
        selectedEntityData.forEach((item) => {
            if (typeof item === "object") {
                const Obj = Object.entries(item);
                filteredObjData.push({
                    key: Obj[0][0],
                    value: Obj[0][1],
                });
            }
        });
        return filteredObjData;
    }

    return (
        <>
            <div className="othersTab">
                <FormGroup sx={{ flexDirection: "row" }}>
                    <Typography>Key</Typography>
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
                            onChange={(_, v) => setSearchFieldValue(v)}
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
                    <Typography>Value</Typography>
                    <Paper component="div" className="dalSearchInput">
                        <InputBase
                            sx={{ ml: 1, flex: 2 }}
                            name="value"
                            onChange={update}
                            inputProps={{ "aria-label": "Add value" }}
                            value={keyValue.value}
                        />
                    </Paper>
                    <Button color="secondary" variant="outlined" onClick={submitHandler}>
                        Add Key Value
                    </Button>
                </FormGroup>
                <FormGroup sx={{ flexDirection: "row" }}>
                    <IDDateComponent />
                </FormGroup>
            </div>
            <TableComponent
                gridRef={gridRef}
                rowData={entityDataObjFormat()}
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
                Are you sure you want to delete the <b>{selectedKeyValue.value}</b> Key Value?
            </ConfirmDialog>
        </>
    );
};

export default KeyValuePairsTab;
