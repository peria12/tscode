import {
    InputBase,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    Paper,
    Dialog,
    DialogContentText,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Snackbar,
    Alert,
} from "@mui/material";

import React, { useEffect, useState, useContext } from "react";
import SearchIcon from "@mui/icons-material/Search";

import { BuildJsonContext } from "../../contexts/BuildJsonContext";

const FieldsListDialog = ({ onClose, fieldsName, open }) => {
    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedFields, setFilteredFields] = useState<any>([]);
    const [snackBaropen, setSnackBaropen] = useState<boolean>(false);
    const [messageInfo, setMessageInfo] = useState<any>();
    const { manageFieldsScreenJson, selectedFieldsData } = useContext(BuildJsonContext);

    const handleListItemDoubleClick = (event) => {
        const id = event.target.innerHTML;
        const isPresent = selectedFieldsData.some((item) => item.id === id);
        if (!isPresent) {
            manageFieldsScreenJson?.({ type: "addFields", payload: { id, label: id } });
            onClose();
            setSnackBaropen(false);
        } else {
            setSnackBaropen(true);
            setMessageInfo({ message: `Field Already Exists`, severity: "error" });
        }
    };
    const handleSearchBox = (event) => {
        setSearchValue(event.target.value);
    };
    useEffect(() => {
        const filterFields = fieldsName.filter((name) => {
            return searchValue.trim().length === 0 ? fieldsName : name.toLowerCase().includes(searchValue);
        });
        setFilteredFields(filterFields);
    }, [searchValue, fieldsName]);

    useEffect(() => {
        setFilteredFields(fieldsName);
    }, [fieldsName]);
    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackBaropen(false);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                className="dal-web fieldListDialog"
            >
                <DialogTitle
                    sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
                    id="scroll-dialog-title"
                >
                    <InputLabel>Field</InputLabel>
                    <Paper component="div" className="dalSearchInput">
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder=""
                            onInput={(e) => handleSearchBox(e)}
                            inputProps={{ "aria-label": "" }}
                        />
                        <SearchIcon sx={{ margin: "4px 5px 0 0" }} color="action" />
                    </Paper>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText
                        id="scroll-dialog-description"
                        tabIndex={-1}
                        sx={{ height: "350px", overflowY: "scroll" }}
                    >
                        <List>
                            {selectedFields.map((value) => (
                                <ListItem key={value}>
                                    <ListItemText
                                        primary={value}
                                        onDoubleClick={(event) => handleListItemDoubleClick(event)}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="error" variant="outlined" onClick={onClose}>
                        Close
                    </Button>
                </DialogActions>
                <Snackbar open={snackBaropen} autoHideDuration={100000} onClose={handleClose}>
                    <Alert
                        variant="filled"
                        onClose={handleClose}
                        severity={messageInfo?.severity}
                        sx={{ width: "100%" }}
                    >
                        {messageInfo?.message}
                    </Alert>
                </Snackbar>
            </Dialog>
        </>
    );
};

export default FieldsListDialog;
