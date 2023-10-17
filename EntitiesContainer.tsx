import React, { useState, useContext } from "react";
import { CardContent, Tabs, Tab, Box } from "@mui/material";
import PropTypes from "prop-types";
import SearchTab from "./SearchTab";
import KeyValuePairsTab from "./KeyValuePairsTab";
import SelectFromExcelTab from "./SelectFromExcel";
import { BuildJsonContext } from "../../contexts/BuildJsonContext";

function TabPanel(props: any) {
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

const EntitiesContainer = () => {
    const [value, setValue] = useState<number>(0);
    const { isFromDalPlugin } = useContext(BuildJsonContext);

    const handleChange = (event: any, newValue: number) => {
        setValue(newValue);
    };
    return (
        <CardContent className="DalTabs">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    TabIndicatorProps={{ style: { background: "none" } }}
                    value={value}
                    onChange={handleChange}
                    className="DalWebTab"
                >
                    <Tab label="Search" {...a11yProps(0)} />
                    <Tab label="Key Value Pairs" {...a11yProps(1)} />
                    <Tab label={isFromDalPlugin ? "Select from Excel" : "Select Values"} {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <SearchTab />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <KeyValuePairsTab />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <SelectFromExcelTab />
            </TabPanel>
        </CardContent>
    );
};

export default EntitiesContainer;
