import React, { useEffect, useState, useContext } from "react";
import { Box, FormGroup, InputBase, InputLabel, MenuItem, Select } from "@mui/material";
import _ from "lodash";
import { BuildJsonContext } from "../../contexts/BuildJsonContext";

const DatesTypesFilter = () => {
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [interval, setInterval] = useState("");
    const [lookback, setLookBack] = useState("");
    const { selectedDatesType, selectedDateInfo, setSelectedDateInfo } = useContext(BuildJsonContext);

    useEffect(() => {
        if (selectedDatesType !== "series") {
            setIsDisabled(true);
            setSelectedDateInfo?.((prev) => {
                return { ...prev, type: selectedDatesType };
            });
            setSelectedDateInfo?.({ type: selectedDatesType });
        } else {
            setIsDisabled(false);
            setSelectedDateInfo?.((prev) => {
                return { ...prev, type: selectedDatesType };
            });
        }
    }, [selectedDatesType]);

    const freqOptions = [
        { label: "", value: "" },
        { label: "Daily", value: "daily" },
        { label: "Weekly", value: "weekly" },
        { label: "Monthly", value: "monthly" },
        { label: "Quarterly", value: "quarterly" },
        { label: "Yearly", value: "yearly" },
    ];
    const fillOptions = [
        { label: "", value: "" },
        { label: "No", value: "no" },
        { label: "Last", value: "last" },
    ];
    const alignOptions = [
        { label: "", value: "" },
        { label: "Start", value: "start" },
        { label: "End", value: "end" },
    ];

    useEffect(() => {
        if (selectedDateInfo && selectedDateInfo.interval) {
            setInterval(selectedDateInfo.interval);
        }
        if (selectedDateInfo && selectedDateInfo.lookback) {
            setLookBack(selectedDateInfo.lookback);
        }
    }, []);

    const handleSelectChange = (name, event) => {
        console.log(name, event.target.value);
        if (name == "freq") {
            setSelectedDateInfo?.((prev) => {
                return { ...prev, freq: { ...prev.freq, unit: event.target.value } };
            });
        }
        if (name == "fill") {
            setSelectedDateInfo?.((prev) => {
                return { ...prev, fill_Missing: event.target.value };
            });
        }
        if (name == "align") {
            setSelectedDateInfo?.((prev) => {
                return { ...prev, freq: { ...prev.freq, align: event.target.value } };
            });
        }
    };

    const onIntervalChange = (val) => {
        if (val !== "") {
            setSelectedDateInfo?.((prev) => {
                return { ...prev, interval: val };
            });
        }
    };

    const onLookBackChange = (val) => {
        if (val !== "") {
            setSelectedDateInfo?.((prev) => {
                return { ...prev, lookback: val };
            });
        }
    };

    useEffect(() => {
        debouncedOnIntervalChange(interval);
        return () => debouncedOnIntervalChange.cancel();
    }, [interval]);

    useEffect(() => {
        debouncedOnLookBackChange(lookback);
        return () => debouncedOnLookBackChange.cancel();
    }, [lookback]);

    const debouncedOnIntervalChange = _.debounce((e) => onIntervalChange(e), 1500);

    const debouncedOnLookBackChange = _.debounce((e) => onLookBackChange(e), 1500);

    return (
        <Box className="dateFilter" sx={{ flex: 1, py: 1 }}>
            <FormGroup sx={{ justifyContent: "space-between", flexDirection: "row", marginBottom: "12px" }}>
                <InputLabel id="label">Frequency</InputLabel>
                <Select
                    sx={{ width: "210px" }}
                    labelId="label"
                    id="frequency"
                    value={selectedDateInfo?.freq?.unit || ""}
                    disabled={isDisabled}
                    onChange={(e) => handleSelectChange("freq", e)}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                "& .MuiMenuItem-root": {
                                    minHeight: 30,
                                },
                            },
                        },
                    }}
                >
                    {freqOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormGroup>
            <FormGroup sx={{ justifyContent: "space-between", flexDirection: "row", marginBottom: "12px" }}>
                <InputLabel id="fillMissing">Fill Missing</InputLabel>
                <Select
                    sx={{ width: "210px" }}
                    onChange={(e) => handleSelectChange("fill", e)}
                    labelId="label"
                    id="select"
                    value={selectedDateInfo?.fill_Missing || ""}
                    disabled={isDisabled}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                "& .MuiMenuItem-root": {
                                    minHeight: 30,
                                },
                            },
                        },
                    }}
                >
                    {fillOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormGroup>
            <FormGroup sx={{ justifyContent: "space-between", flexDirection: "row", marginBottom: "12px" }}>
                <InputLabel id="align">Align</InputLabel>
                <Select
                    sx={{ width: "210px" }}
                    onChange={(e) => handleSelectChange("align", e)}
                    labelId="label"
                    id="align"
                    value={selectedDateInfo?.freq?.align || ""}
                    disabled={isDisabled}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                "& .MuiMenuItem-root": {
                                    minHeight: 30,
                                },
                            },
                        },
                    }}
                >
                    {alignOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormGroup>
            <FormGroup sx={{ justifyContent: "space-between", flexDirection: "row", marginBottom: "12px" }}>
                <InputLabel id="label">Interval</InputLabel>
                <InputBase
                    className="dalSearchInput dateInput"
                    inputProps={{ "aria-label": "Add interval" }}
                    onChange={(e) => {
                        setInterval(e.target.value);
                    }}
                    value={interval}
                    disabled={isDisabled}
                    sx={{ paddingLeft: "10px" }}
                />
            </FormGroup>
            <FormGroup sx={{ justifyContent: "space-between", flexDirection: "row", marginBottom: "12px" }}>
                <InputLabel id="label">Look Back</InputLabel>
                <InputBase
                    inputProps={{ "aria-label": "Add look back" }}
                    className="dalSearchInput dateInput"
                    onChange={(e) => {
                        setLookBack(e.target.value);
                    }}
                    value={lookback}
                    disabled={isDisabled}
                    sx={{ paddingLeft: "10px" }}
                />
            </FormGroup>
        </Box>
    );
};

export default DatesTypesFilter;
