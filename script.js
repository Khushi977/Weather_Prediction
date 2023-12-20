const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  uvIndex = document.querySelector(".uv-index"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "week";

// function to get date and time
function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // 12 hours format
  hour = hour % 12;
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

//Updating date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

// function to get public ip address
function getPublicIp() {
  fetch("https://geolocation-db.com/json/", {
    method: "GET",
    headers: {},
  })
    .then((response) => response.json())
    .then((data) => {
      currentCity = data.city;
      getWeatherData(data.city, currentUnit, hourlyorWeek);
    })
    .catch((err) => {
      console.error(err);
    });
}

getPublicIp();

// function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }
      currentLocation.innerText = data.resolvedAddress;
      condition.innerText = today.conditions;
      rain.innerText = "Perc - " + today.precip + "%";
      uvIndex.innerText = today.uvindex;
      windSpeed.innerText = today.windspeed;
      measureUvIndex(today.uvindex);
      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);
      humidity.innerText = today.humidity + "%";
      updateHumidityStatus(today.humidity);
      visibilty.innerText = today.visibility;
      updateVisibiltyStatus(today.visibility);
      airQuality.innerText = today.winddir;
      updateAirQualityStatus(today.winddir);
      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
      }
      sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
      sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
    })
    .catch((err) => {
      alert("City not found in our database");
    });
}

//function to update Forecast
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celciusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
    weatherCards.appendChild(card);
    day++;
  }
}

// function to change weather icons
function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "https://i.ibb.co/PZQXH8V/27.png";
  } else if (condition === "partly-cloudy-night") {
    return "https://i.ibb.co/Kzkk59k/15.png";
  } else if (condition === "rain") {
    return "https://i.ibb.co/kBd2NTS/39.png";
  } else if (condition === "clear-day") {
    return "https://i.ibb.co/rb4rrJL/26.png";
  } else if (condition === "clear-night") {
    return "https://i.ibb.co/1nxNGHL/10.png";
  } else {
    return "https://i.ibb.co/rb4rrJL/26.png";
  }
}

// function to change background depending on weather conditions
function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === "partly-cloudy-day") {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  } else if (condition === "partly-cloudy-night") {
    bg = "https://i.ibb.co/RDfPqXz/pcn.jpg";
  } else if (condition === "rain") {
    bg = "https://i.ibb.co/h2p6Yhd/rain.webp";
  } else if (condition === "clear-day") {
    bg = "https://i.ibb.co/WGry01m/cd.jpg";
  } else if (condition === "clear-night") {
    bg = "https://i.ibb.co/kqtZ1Gx/cn.jpg";
  } else {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  }
  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

//get hours from hh:mm:ss
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

// convert time to 12 hour format
function covertTimeTo12HourFormat(time) {
  let hour = time.split(":")[0];
  let minute = time.split(":")[1];
  let ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  let strTime = hour + ":" + minute + " " + ampm;
  return strTime;
}

// function to get day name from date
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

// function to get uv index status
function measureUvIndex(uvIndex) {
  if (uvIndex <= 2) {
    uvText.innerText = "Low";
  } else if (uvIndex <= 5) {
    uvText.innerText = "Moderate";
  } else if (uvIndex <= 7) {
    uvText.innerText = "High";
  } else if (uvIndex <= 10) {
    uvText.innerText = "Very High";
  } else {
    uvText.innerText = "Extreme";
  }
}

// function to get humidity status
function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

// function to get visibility status
function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Dense Fog";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Moderate Fog";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Light Fog";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Very Light Fog";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Light Mist";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Very Light Mist";
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Clear Air";
  } else {
    visibilityStatus.innerText = "Very Clear Air";
  }
}

// function to get air quality status
function updateAirQualityStatus(airquality) {
  if (airquality <= 50) {
    airQualityStatus.innerText = "Good👌";
  } else if (airquality <= 100) {
    airQualityStatus.innerText = "Moderate😐";
  } else if (airquality <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups😷";
  } else if (airquality <= 200) {
    airQualityStatus.innerText = "Unhealthy😷";
  } else if (airquality <= 250) {
    airQualityStatus.innerText = "Very Unhealthy😨";
  } else {
    airQualityStatus.innerText = "Hazardous😱";
  }
}

// function to handle search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(location, currentUnit, hourlyorWeek);
  }
});

// function to conver celcius to fahrenheit
function celciusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32).toFixed(1);
}


var currentFocus;
search.addEventListener("input", function (e) {
  removeSuggestions();
  var a,
    b,
    i,
    val = this.value;
  if (!val) {
    return false;
  }
  currentFocus = -1;

  a = document.createElement("ul");
  a.setAttribute("id", "suggestions");

  this.parentNode.appendChild(a);

  for (i = 0; i < cities.length; i++) {
    /*check if the item starts with the same letters as the text field value:*/
    if (
      cities[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()
    ) {
      /*create a li element for each matching element:*/
      b = document.createElement("li");
      /*make the matching letters bold:*/
      b.innerHTML =
        "<strong>" + cities[i].name.substr(0, val.length) + "</strong>";
      b.innerHTML += cities[i].name.substr(val.length);
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML += "<input type='hidden' value='" + cities[i].name + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
      b.addEventListener("click", function (e) {
        /*insert the value for the autocomplete text field:*/
        search.value = this.getElementsByTagName("input")[0].value;
        removeSuggestions();
      });

      a.appendChild(b);
    }
  }
});
/*execute a function presses a key on the keyboard:*/
search.addEventListener("keydown", function (e) {
  var x = document.getElementById("suggestions");
  if (x) x = x.getElementsByTagName("li");
  if (e.keyCode == 40) {
    /*If the arrow DOWN key
      is pressed,
      increase the currentFocus variable:*/
    currentFocus++;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 38) {
    /*If the arrow UP key
      is pressed,
      decrease the currentFocus variable:*/
    currentFocus--;
    /*and and make the current item more visible:*/
    addActive(x);
  }
  if (e.keyCode == 13) {
    /*If the ENTER key is pressed, prevent the form from being submitted,*/
    e.preventDefault();
    if (currentFocus > -1) {
      /*and simulate a click on the "active" item:*/
      if (x) x[currentFocus].click();
    }
  }
});
function addActive(x) {
  /*a function to classify an item as "active":*/
  if (!x) return false;
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  /*add class "autocomplete-active":*/
  x[currentFocus].classList.add("active");
}
function removeActive(x) {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("active");
  }
}

function removeSuggestions() {
  var x = document.getElementById("suggestions");
  if (x) x.parentNode.removeChild(x);
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("c");
});

// function to change unit
function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (unit === "c") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

// function to change hourly to weekly or vice versa
function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}



// Cities add your own to get in search

cities = [
  {
    country: "India",
    name: "Andaman and Nicobar",
    lat: "11.66702557	",
    lng: "92.73598262",
  },
  {
    country: "India",
    name: "Andhra Pradesh",
    lat: "14.7504291",
    lng: "78.57002559",
  },
  {
    country: "India",
    name: "Arunachal Pradesh",
    lat: "27.10039878",
    lng: "93.61660071",
  },
  {
    country: "India",
    name: "Assam",
    lat: "26.7499809",
    lng: "94.21666744",
  },
  {
    country: "India",
    name: "Bihar",
    lat: "25.096073",
    lng: "85.313118",
  },
  {
    country: "India",
    name: "Dharbhanga",
    lat: "26.156349",
    lng: "85.894318",
  },
  {
    country: "India",
    name: "Patna",
    lat: "25.62495913",
    lng: "85.13003861",
  },
  {
    country: "India",
    name: "Chandighar",
    lat: "30.71999697",
    lng: "76.78000565",
  },
  {
    country: "India",
    name: "Delhi",
    lat: "28.6699929",
    lng: "77.23000403",
  },
  {
    country: "India",
    name: "New Delhi",
    lat: "28.60002301",
    lng: "77.19998002",
  },
  {
    country: "India",
    name: "Goa",
    lat: "15.491997",
    lng: "73.81800065",
  },
  {
    country: "India",
    name: "Haryana",
    lat: "28.45000633",
    lng: "77.01999101",
  },
  {
    country: "India",
    name: "Jammu & Kashmir",
    lat: "34.29995933",
    lng: "74.46665849",
  },
  {
    country: "India",
    name: "Jharkhand",
    lat: "23.80039349",
    lng: "86.41998572",
  },
  {
    country: "India",
    name: "Karnatka",
    lat: "12.57038129",
    lng: "76.91999711",
  },
  {
    country: "India",
    name: "Kerela",
    lat: "8.900372741",
    lng: "76.56999263",
  },
  {
    country: "India",
    name: "Lakshdweep",
    lat: "10.56257331",
    lng: "72.63686717",
  },
  {
    country: "India",
    name: "Madhya Pradesh",
    lat: "21.30039105",
    lng: "76.13001949",
  },
  {
    country: "India",
    name: "Maharashtra",
    lat: "19.25023195",
    lng: "19.25023195",
  },
  {
    country: "India",
    name: "Manipur",
    lat: "24.79997072",
    lng: "93.95001705",
  },
  {
    country: "India",
    name: "Mizoram",
    lat: "23.71039899",
    lng: "92.72001461",
  },
  {
    country: "India",
    name: "Meghalaya",
    lat: "25.57049217",
    lng: "91.8800142",
  },
  {
    country: "India",
    name: "Nagaland",
    lat: "25.6669979",
    lng: "94.11657019",
  },
  {
    country: "India",
    name: "Orissa",
    lat: "19.82042971",
    lng: "85.90001746",
  },
  {
    country: "India",
    name: "Puducherry",
    lat: "11.93499371",
    lng: "79.83000037",
  },
  {
    country: "India",
    name: "Punjab",
    lat: "31.51997398",
    lng: "75.98000281",
  },
  {
    country: "India",
    name: "Rajasthan",
    lat: "26.44999921",
    lng: "74.63998124",
  },
  {
    country: "India",
    name: "Sikkim",
    lat: "27.3333303",
    lng: "88.6166475",
  },
  {
    country: "India",
    name: "Tamil Nadu",
    lat: "12.92038576",
    lng: "79.15004187",
  },
  {
    country: "India",
    name: "Tripura",
    lat: "23.83540428",
    lng: "91.27999914",
  },
  {
    country: "India",
    name: "Uttar Pradesh",
    lat: "27.59998069",
    lng: "78.05000565",
  },
  {
    country: "India",
    name: "Agra",
    lat: "27.17042035",
    lng: "78.01502071",
  },
  {
    country: "India",
    name: "Allahbad",
    lat: "25.45499534",
    lng: "81.84000688",
  },
  {
    country: "India",
    name: "Lucknow",
    lat: "26.85503908",
    lng: "80.91499874",
  },
  {
    country: "India",
    name: "Mathura",
    lat: "27.4999868",
    lng: "77.67002885",
  },
  {
    country: "India",
    name: "Meerut",
    lat: "29.00041201",
    lng: "77.70000118",
  },
  {
    country: "India",
    name: "Mirzapur",
    lat: "25.145376",
    lng: "82.56998816",
  },
  {
    country: "India",
    name: "Varanasi",
    lat: "25.32999005",
    lng: "83.00003943",
  },
  {
    country: "India",
    name: "West Bengal",
    lat: "22.58039044",
    lng: "88.32994665",
  },
  {
    country: "India",
    name: "Asansol",
    lat: "23.6833333",
    lng: "86.9833333",
  },
  {
    country: "India",
    name: "Barddhaman",
    lat: "23.25037539",
    lng: "87.86496212",
  },
  {
    country: "India",
    name: "Kolkata",
    lat: "22.4949693",
    lng: "88.32467566",
  },
  {
    country: "India",
    name: "Siliguri",
    lat: "26.72042198",
    lng: "88.45500362",
  },
  {
    country: "India",
    name: "Bhimbar",
    lat: "32.97465",
    lng: "74.07846",
  },
  {
    country: "PK",
    name: "Bhiria",
    lat: "26.91041",
    lng: "68.19466",
  },
  {
    country: "PK",
    name: "Bhit Shah",
    lat: "25.80565",
    lng: "68.49143",
  },
  {
    country: "PK",
    name: "Bhopalwala",
    lat: "32.42968",
    lng: "74.3635",
  },
  {
    country: "PK",
    name: "Bozdar Wada",
    lat: "27.183",
    lng: "68.6358",
  },
  {
    country: "PK",
    name: "Bulri",
    lat: "24.86667",
    lng: "68.33333",
  },
  {
    country: "PK",
    name: "Būrewāla",
    lat: "30.16667",
    lng: "72.65",
  },
  {
    country: "PK",
    name: "Chak",
    lat: "27.85838",
    lng: "68.83378",
  },
  {
    country: "PK",
    name: "Chak Azam Sahu",
    lat: "30.75202",
    lng: "73.02834",
  },
  {
    country: "PK",
    name: "Chak Five Hundred Seventy-five",
    lat: "31.54514",
    lng: "73.82891",
  },
  {
    country: "PK",
    name: "Chak Jhumra",
    lat: "31.56808",
    lng: "73.18317",
  },
  {
    country: "PK",
    name: "Chak One Hundred Twenty Nine Left",
    lat: "30.42919",
    lng: "73.04522",
  },
  {
    country: "PK",
    name: "Chak Thirty-one -Eleven Left",
    lat: "30.42388",
    lng: "72.69737",
  },
  {
    country: "PK",
    name: "Chak Two Hundred Forty-nine Thal Development Authority",
    lat: "31.17772",
    lng: "71.2048",
  },
  {
    country: "PK",
    name: "Chakwal",
    lat: "32.93286",
    lng: "72.85394",
  },
  {
    country: "PK",
    name: "Chaman",
    lat: "30.91769",
    lng: "66.45259",
  },
  
  
  
 
];