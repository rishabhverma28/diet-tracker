import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
// App CSS Import
import "./App.css";
// Material UI Component Imports
import Appbar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import LeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import RightIcon from "@material-ui/icons/KeyboardArrowRight";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import CloseIcon from "@material-ui/icons/Close";
import TextField from "@material-ui/core/TextField";
import { Button } from "@material-ui/core";
import { LinearProgress } from "@material-ui/core";

// data imports
import diet from "./diet";
import meals from "./meals";

// URL Definitions
const API_URL = "https://trackapi.nutritionix.com/v2/search/instant";
const API_URL_NUTRITION =
    "https://trackapi.nutritionix.com/v2/natural/nutrients/";
const API_URL_BRANDED = "https://trackapi.nutritionix.com/v2/search/item";
const PERSON_AVTAR_URL = "https://randomuser.me/api/portraits/women/3.jpg";

// Nutritionix API Keys
const APP_ID = process.env.REACT_APP_NUTRITIONIX_APP_ID;
const API_KEY = process.env.REACT_APP_NUTRITIONIX_KEY;

// Main Function
function App() {
    // States
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [multiplier, setMultiplier] = useState(1);
    const [multipliedCaloriesGrams, setMultipliedCaloriesGrams] = useState([
        0,
        0
    ]);
    const [selectedItemCaloriesGrams, setSelectedItemCaloriesGrams] = useState([
        0,
        0
    ]);
    const [currentDaySelected, setCurrentDaySelected] = useState(0);
    const [searching, setSearching] = useState(false);
    const [personData, setPersonData] = useState(diet);
    const [open, setOpen] = useState(false);
    const [mealType, setMealType] = useState({
        value: "Breakfast",
        label: "Breakfast"
    });

    // Refs
    const searchRef = useRef(null);

    // Function to handle escape key press to hide the search results
    const keyHandler = evt => {
        if (evt.keyCode === 27) {
            setSearching(false);
        }
    };
    // Event listener to listen to escape key press
    useEffect(() => {
        document.addEventListener("keydown", keyHandler);
        return () => {
            document.removeEventListener("keydown", keyHandler);
        };
    }, [searching]);

    // Functions to show and hide the Dialog
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    // Function to handle floating button click
    const buttonClick = () => {
        searchRef.current.focus();
    };

    // Function to handle the left and right button clicks in the today section
    const handleDayClick = evt => {
        const buttonClicked = evt.currentTarget.dataset.buttonType;
        const totalDataPoints = personData.data_points.length;
        buttonClicked === "left"
            ? setCurrentDaySelected(prev =>
                  prev - 1 === -1
                      ? (prev = totalDataPoints - 1)
                      : (prev = prev - 1)
              )
            : setCurrentDaySelected(prev =>
                  prev + 1 === totalDataPoints ? (prev = 0) : (prev = prev + 1)
              );
    };

    // Function for the GET call to the API for search results
    useEffect(() => {
        const headers = {
            "x-app-id": APP_ID,
            "x-app-key": API_KEY
        };
        if (searchText.length === 0) {
            setSearching(false);
            setSearchResults([]);
        } else {
            setSearching(true);
            const fetchData = async () => {
                const result = await axios(API_URL + `?query=${searchText}`, {
                    headers
                });
                setSearchResults(result.data);
            };
            fetchData();
        }
    }, [searchText]);

    // Function for the POST call to the API for the common food items info
    const handleClickResults = data => {
        handleClickOpen();
        setSearching(false);
        fetch(API_URL_NUTRITION, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-app-id": APP_ID,
                "x-app-key": API_KEY
            },
            body: JSON.stringify({
                query: data,
                timezone: "Australia/Sydney"
            })
        })
            .then(resp => resp.json())
            .then(data => {
                setSelectedItem(data.foods[0]);
                setSelectedItemCaloriesGrams([
                    data.foods[0].serving_weight_grams === null
                        ? 1
                        : data.foods[0].serving_weight_grams,
                    data.foods[0].nf_calories
                ]);
                setMultipliedCaloriesGrams([
                    data.foods[0].serving_weight_grams === null
                        ? 1
                        : data.foods[0].serving_weight_grams,
                    data.foods[0].nf_calories
                ]);
            });
    };

    // Function for the GET call to the API for the branded food items info
    const handleClickResultsBranded = data => {
        handleClickOpen();
        setSearching(false);
        fetch(API_URL_BRANDED + `?nix_item_id=${data}`, {
            method: "GET",
            headers: {
                "x-app-id": APP_ID,
                "x-app-key": API_KEY
            }
        })
            .then(res => res.json())
            .then(data => {
                setSelectedItem(data.foods[0]);
                setSelectedItemCaloriesGrams([
                    data.foods[0].serving_weight_grams === null
                        ? 1
                        : data.foods[0].serving_weight_grams,
                    data.foods[0].nf_calories
                ]);
                setMultipliedCaloriesGrams([
                    data.foods[0].serving_weight_grams === null
                        ? 1
                        : data.foods[0].serving_weight_grams,
                    data.foods[0].nf_calories
                ]);
            });
    };

    // Function to handle the number increase in the Dialog
    const handleNumberChange = evt => {
        const nums = evt.target.value;
        setMultiplier(evt.target.value);
        setMultipliedCaloriesGrams(
            selectedItemCaloriesGrams.map(x => x * nums)
        );
    };

    // Function to handle the click of the "ADD" button in the dialog
    const handleClickAdd = () => {
        let mealData = {};
        mealData["food_name"] = selectedItem.food_name;
        mealData["serving_qty"] = selectedItem.serving_qty;
        mealData["serving_unit"] = selectedItem.serving_unit;
        mealData["serving_weight_grams"] = selectedItem.serving_weight_grams;
        mealData["nf_calories"] = selectedItem.nf_calories;
        mealData["serving_size"] = multiplier;
        mealData["meal_type"] = mealType.value;
        mealData["thumb"] = selectedItem.photo.thumb;
        let personDataCopy = personData;
        personDataCopy.data_points[currentDaySelected].intake_list.push(
            mealData
        );
        setPersonData(personDataCopy);
        handleClose();
    };

    // Define variables calculate the change in meal calories as soon it updates
    const breakfastCalories = personData.data_points[
        currentDaySelected
    ].intake_list
        .filter(val => val.meal_type === "breakfast")
        .reduce(
            (acc, curr) => acc + Number(curr.serving_size * curr.nf_calories),
            0
        );
    const lunchCalories = personData.data_points[currentDaySelected].intake_list
        .filter(val => val.meal_type === "lunch")
        .reduce(
            (acc, curr) => acc + Number(curr.serving_size * curr.nf_calories),
            0
        );
    const dinnerCalories = personData.data_points[
        currentDaySelected
    ].intake_list
        .filter(val => val.meal_type === "dinner")
        .reduce(
            (acc, curr) => acc + Number(curr.serving_size * curr.nf_calories),
            0
        );
    const snacksCalories = personData.data_points[
        currentDaySelected
    ].intake_list
        .filter(val => val.meal_type === "snack")
        .reduce(
            (acc, curr) => acc + Number(curr.serving_size * curr.nf_calories),
            0
        );

    // Define the total calories as the sum of the above calories
    const totalCalories =
        breakfastCalories + lunchCalories + dinnerCalories + snacksCalories;

    return (
        <Grid className="App">
            <Appbar position="static" className="app-appbar">
                <div className="app-search">
                    <SearchIcon className="app-search-icon" />
                    <InputBase
                        placeholder="Search foods..."
                        inputProps={{ "aria-label": "search" }}
                        onChange={e => setSearchText(e.target.value)}
                        value={searchText}
                        inputRef={searchRef}
                        className="app-search-text-box"
                    />
                </div>

                {selectedItem ? (
                    <Dialog onClose={handleClose} open={open}>
                        <MuiDialogTitle
                            id="customized-dialog-title"
                            onClose={handleClose}
                        >
                            <img
                                src={selectedItem.photo.thumb}
                                alt={selectedItem.food_name}
                                className="dialog-food-img"
                            />
                            <IconButton
                                aria-label="close"
                                onClick={handleClose}
                                className="close-button"
                            >
                                <CloseIcon />
                            </IconButton>
                            <div className="dialog-food-name">
                                {selectedItem.food_name}
                            </div>
                        </MuiDialogTitle>
                        <MuiDialogContent>
                            <TextField
                                type="number"
                                label="Servings"
                                value={multiplier}
                                inputProps={{
                                    min: "1",
                                    max: "10",
                                    step: "0.5"
                                }}
                                className="dialog-servings-input"
                                onChange={handleNumberChange}
                            />
                            <div className="dialog-servings-info-all">
                                <div className="dialog-servings-info">
                                    <span className="dialog-servings-info-number">
                                        {multipliedCaloriesGrams[0].toFixed()}
                                    </span>
                                    <span className="dialog-servings-info-desc">
                                        grams
                                    </span>
                                </div>
                                <div className="dialog-servings-info">
                                    <span className="dialog-servings-info-number">
                                        {multipliedCaloriesGrams[1].toFixed()}
                                    </span>
                                    <span className="dialog-servings-info-desc">
                                        calories
                                    </span>
                                </div>
                            </div>
                            <div className="dialog-serving-unit">
                                {selectedItem.serving_unit}
                            </div>
                            <div className="add-to-today">ADD TO TODAY</div>
                            <TextField
                                select
                                id="select-meal"
                                value={mealType.label}
                                margin="normal"
                                onChange={e =>
                                    setMealType({
                                        value: e.target.value,
                                        label: e.target.value
                                    })
                                }
                            >
                                {meals.map(option => {
                                    return (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    );
                                })}
                            </TextField>
                            <div className="dialog-add-btn-container">
                                <Button
                                    color="primary"
                                    className="dialog-add-btn"
                                    variant="contained"
                                    onClick={handleClickAdd}
                                >
                                    ADD
                                </Button>
                            </div>
                        </MuiDialogContent>
                    </Dialog>
                ) : (
                    ""
                )}

                <Grid container spacing={0} className="mobile-person-details">
                    <Grid item xs={8}>
                        <Avatar
                            src={PERSON_AVTAR_URL}
                            className="person-avatar"
                        ></Avatar>
                        <span className="person-first-name">
                            {personData.first_name}
                        </span>
                    </Grid>
                    <Grid item xs={2}>
                        <div className="person-info-metrics">
                            <span className="person-info-metrics-number">
                                {personData.weight_kg}
                            </span>
                            <span>kg</span>
                        </div>
                    </Grid>
                    <Grid item xs={2}>
                        <div className="person-info-metrics">
                            <span className="person-info-metrics-number">
                                {personData.height_cm}
                            </span>
                            <span>cm</span>
                        </div>
                    </Grid>
                </Grid>
            </Appbar>
            <div className="app-dayview">
                <IconButton
                    className="app-dayview-dir-icons"
                    onClick={handleDayClick}
                    data-button-type="left"
                >
                    <LeftIcon />
                </IconButton>
                {personData.data_points[currentDaySelected].date === ""
                    ? "Today"
                    : personData.data_points[currentDaySelected].date}
                <IconButton
                    className="app-dayview-dir-icons"
                    onClick={handleDayClick}
                    data-button-type="right"
                >
                    <RightIcon />
                </IconButton>
            </div>
            <Grid container spacing={0}>
                <Grid item xs={12} sm={5} md={4} className="user-info">
                    <Grid
                        container
                        spacing={0}
                        className="user-info-metrics"
                        alignItems="center"
                        justify="center"
                    >
                        <Grid item md={4}>
                            <div className="person-info-metrics">
                                <span className="person-info-metrics-number">
                                    {personData.weight_kg}
                                </span>
                                <span>kg</span>
                            </div>
                        </Grid>
                        <Grid item md={4}>
                            <span className="person-info-name">
                                <Avatar
                                    src="https://randomuser.me/api/portraits/women/3.jpg"
                                    className="desktop-person-avatar"
                                ></Avatar>
                            </span>
                        </Grid>
                        <Grid item md={4}>
                            <div className="person-info-metrics">
                                <span className="person-info-metrics-number">
                                    {personData.height_cm}
                                </span>
                                <span>cm</span>
                            </div>
                        </Grid>
                        <Grid item md={12} className="desktop-user-full-name">
                            {personData.first_name + " " + personData.last_name}
                        </Grid>
                    </Grid>

                    <Grid container className="person-calories">
                        <Grid item xs={6} className="person-calories-consumed">
                            {totalCalories.toFixed() + " cal"}
                            <span className="person-calories-details">
                                consumed
                            </span>
                        </Grid>
                        <Grid item xs={6} className="person-calories-goal">
                            {personData.daily_goal + " cal"}
                            <span className="person-calories-details">
                                daily goal
                            </span>
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            className="person-calories-percentage"
                        >
                            <LinearProgress
                                variant="determinate"
                                color={
                                    totalCalories / personData.daily_goal > 1
                                        ? "secondary"
                                        : "primary"
                                }
                                value={
                                    totalCalories / personData.daily_goal > 1
                                        ? 100
                                        : Number(
                                              (
                                                  (totalCalories /
                                                      personData.daily_goal) *
                                                  100
                                              ).toFixed()
                                          )
                                }
                            />
                            <div className="person-calories-percentage-detail">
                                {(
                                    (totalCalories / personData.daily_goal) *
                                    100
                                ).toFixed() + "%"}
                            </div>
                        </Grid>
                    </Grid>
                    <Grid container className="person-calories">
                        <Grid item xs={3}>
                            <div className="person-calories-cal">
                                {breakfastCalories.toFixed()}
                            </div>
                            <div className="person-calories-meal">
                                {" "}
                                Breakfast
                            </div>
                        </Grid>
                        <Grid item xs={3}>
                            <div className="person-calories-cal">
                                {lunchCalories.toFixed()}
                            </div>
                            <div className="person-calories-meal">Lunch</div>
                        </Grid>
                        <Grid item xs={3}>
                            <div className="person-calories-cal">
                                {dinnerCalories.toFixed()}
                            </div>
                            <div className="person-calories-meal">Dinner</div>
                        </Grid>
                        <Grid item xs={3}>
                            <div className="person-calories-cal">
                                {snacksCalories.toFixed()}
                            </div>
                            <div className="person-calories-meal">Snack</div>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={7} md={8} className="daily-food-items">
                    {personData.data_points[currentDaySelected].intake_list.map(
                        (data, i) => {
                            return (
                                <div className="daily-food-item" key={i}>
                                    <Grid container>
                                        <Grid item xs={2} md={1}>
                                            <img
                                                src={data.thumb}
                                                alt="thumbnail"
                                                className="daily-food-item-img"
                                            />
                                        </Grid>
                                        <Grid
                                            item
                                            xs={7}
                                            md={9}
                                            className="daily-food-item-border"
                                        >
                                            <div className="daily-food-item-bold">
                                                {data.food_name}
                                            </div>
                                            <div className="daily-food-item-faint lowercase">
                                                {data.serving_size +
                                                    " " +
                                                    data.serving_unit +
                                                    " (" +
                                                    (
                                                        data.serving_size *
                                                        data.serving_weight_grams
                                                    ).toFixed() +
                                                    " g)"}
                                            </div>
                                        </Grid>
                                        <Grid
                                            item
                                            xs={3}
                                            md={2}
                                            className="daily-food-item-border daily-food-item-meal-info"
                                        >
                                            <div className="daily-food-item-bold lowercase">
                                                {(
                                                    data.serving_size *
                                                    data.nf_calories
                                                ).toFixed() + " cal"}
                                            </div>
                                            <div className="daily-food-item-faint">
                                                {data.meal_type}
                                            </div>
                                        </Grid>
                                    </Grid>
                                </div>
                            );
                        }
                    )}
                    <Fab
                        color="primary"
                        onClick={buttonClick}
                        className="floating-button"
                    >
                        <AddIcon />
                    </Fab>
                </Grid>
            </Grid>
            {searching && (
                <div className="app-search-results-container">
                    <div className="app-search-results">
                        {"common" in searchResults ? (
                            <div>
                                <span className="app-search-results-headers">
                                    Common
                                </span>
                                <ul className="app-search-results-list">
                                    {searchResults.common
                                        .slice(0, 5)
                                        .map((commonMap, i) => {
                                            return (
                                                <li
                                                    key={i}
                                                    onClick={() =>
                                                        handleClickResults(
                                                            commonMap.food_name
                                                        )
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            commonMap.photo
                                                                .thumb
                                                        }
                                                        alt={commonMap.tag_name}
                                                        className="app-search-results-list-img"
                                                    />
                                                    <span className="app-search-results-list-name">
                                                        {commonMap.food_name}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                </ul>
                            </div>
                        ) : null}
                        {"branded" in searchResults ? (
                            <div>
                                <span className="app-search-results-headers">
                                    Branded
                                </span>
                                <ul className="app-search-results-list">
                                    {searchResults.branded
                                        .slice(0, 5)
                                        .map((brandedMap, i) => {
                                            return (
                                                <li
                                                    key={i}
                                                    onClick={() =>
                                                        handleClickResultsBranded(
                                                            brandedMap.nix_item_id
                                                        )
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            brandedMap.photo
                                                                .thumb
                                                        }
                                                        alt={
                                                            brandedMap.tag_name
                                                        }
                                                        className="app-search-results-list-img"
                                                    />
                                                    <span className="app-search-results-list-name">
                                                        {brandedMap.food_name}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </Grid>
    );
}

export default App;
