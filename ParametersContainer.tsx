import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import { Button, CardContent, Tabs, Tab, Box } from "@mui/material";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import SubFieldParameter from "./SubFieldParameter";
import FiltersParameter from "./FiltersParameter";
import OthersParameters from "./OthersParameters";
import NestedSubFieldContainer from "./NestedSubFieldContainer";

import { BuildJsonContext } from "../../contexts/BuildJsonContext";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ padding: "24px 0" }}>
                    <Box>{children}</Box>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

export default function ParametersContainer({
    selectedField,
    handleSubFieldModal,
    selectedNestedField,
}: {
    selectedField: any;
    handleSubFieldModal: any;
    selectedNestedField: any;
}) {
    const [value, setValue] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const {
        manageFieldsScreenJson,
        selectedFilterData,
        savedFilterData,
        selectedSubFieldsData,
        savedSubFieldsData,
        selectedOthersData,
        savedOthersData,
    } = useContext(BuildJsonContext);

    const handleChange = (event: any, newValue: number) => {
        setValue(newValue);
    };
    const handleNestedSubFieldModal = () => {
        setIsOpen(false);
    };

    const saveParametersTabData = () => {
        manageFieldsScreenJson?.({ type: "saveSubFieldsData", payload: selectedSubFieldsData });
        manageFieldsScreenJson?.({ type: "saveFiltersData", payload: selectedFilterData });
        manageFieldsScreenJson?.({ type: "saveOthersData", payload: selectedOthersData });
    };
    const resetParametersTabData = () => {
        manageFieldsScreenJson?.({ type: "resetSubFieldsData" });
        manageFieldsScreenJson?.({ type: "updateSubFieldsData", payload: savedSubFieldsData });
        manageFieldsScreenJson?.({ type: "resetFiltersData" });
        manageFieldsScreenJson?.({ type: "updateFiltersData", payload: savedFilterData });
        manageFieldsScreenJson?.({ type: "resetOthersData" });
        manageFieldsScreenJson?.({ type: "updateOthersData", payload: savedOthersData });
    };
    const handleSaveParameters = () => {
        saveParametersTabData();
        handleSubFieldModal(false);
    };
    const handleCancel = () => {
        resetParametersTabData();
        handleSubFieldModal(false);
    };
    return (
        <CardContent className="DalWebTab">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    TabIndicatorProps={{ style: { background: "none" } }}
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                >
                    <Tab label="Subfield" {...a11yProps(0)} />
                    <Tab label="Filters" {...a11yProps(1)} />
                    <Tab label="Others" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <SubFieldParameter selectedField={selectedField} selectedNestedField={selectedNestedField} />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <FiltersParameter selectedField={selectedField} />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <OthersParameters selectedField={selectedField} />
            </TabPanel>
            <div className="flex-container">
                <Button color="error" variant="outlined" onClick={() => handleCancel()}>
                    Cancel
                </Button>
                <Button color="secondary" variant="outlined" onClick={() => setIsOpen(true)}>
                    Add Fields
                </Button>
                <Button variant="contained" color="primary" onClick={() => handleSaveParameters()}>
                    Save Parameters
                </Button>
            </div>

            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="dal-web fields-pop-up">
                <DialogTitle>Parameter {selectedField}</DialogTitle>
                <DialogContent>
                    <NestedSubFieldContainer
                        handleNestedSubFieldModal={handleNestedSubFieldModal}
                        selectedField={selectedField}
                    />
                </DialogContent>
            </Dialog>

            {/* <CustomModal
        showModal={isOpen}
        bodyComponent={<NestedSubFieldContainer handleNestedSubFieldModal={handleNestedSubFieldModal} selectedField={selectedField}/>}
        className={'Modal nestedfields'}
      /> */}
        </CardContent>
    );
}
