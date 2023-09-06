//add tile and map
var streets = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

var satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

var basemaps = {
  Streets: streets,
  Satellite: satellite,
};

const map = L.map("map", {
  preferCanvas: true,
  updateWhenZooming: false,
  updateWhenIdle: true,
  layers: [streets],
}).fitWorld();

// markers
var airports = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

var cities = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

var universities = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

var stadiums = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

var hospitals = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

var overlays = {
  Airports: airports,
  Cities: cities,
  Universities: universities,
  Stadiums: stadiums,
  Hospitals: hospitals,
};

var layerControl = L.control.layers(basemaps, overlays).addTo(map);

var airportIcon = L.ExtraMarkers.icon({
  prefix: "fa-solid",
  icon: "fa-plane",
  iconColor: "black",
  markerColor: "white",
  shape: "square",
});

var cityIcon = L.ExtraMarkers.icon({
  prefix: "fa-solid",
  icon: "fa-city",
  markerColor: "blue",
  shape: "square",
});

var universityIcon = L.ExtraMarkers.icon({
  prefix: "fa-solid",
  icon: "fa-graduation-cap",
  iconColor: "gold",
  shape: "square",
});

var hospitalIcon = L.ExtraMarkers.icon({
  prefix: "fa-solid",
  icon: "fa-square-h fa-xl",
  iconColor: "white",
  markerColor: "red",
  shape: "circle",
});

var stadiumIcon = L.ExtraMarkers.icon({
  prefix: "fa-solid",
  icon: "fa-futbol",
  iconColor: "white",
  markerColor: "green",
  shape: "square",
});

// border outline
var countryBorders = L.geoJSON().addTo(map);

$(window).on("load", () => {
  var info = L.easyButton("fa-solid fa-circle-info fa-lg", (btn, map) => {
    $("#info").modal("show");
  }).addTo(map);

  var wiki = L.easyButton("fa-solid fa-globe fa-lg", (btn, map) => {
    $("#wiki").modal("show");
  }).addTo(map);

  var weather = L.easyButton("fa-solid fa-cloud-sun-rain fa-lg", (btn, map) => {
    $("#weather").modal("show");
  }).addTo(map);

  var currency = L.easyButton("fa-solid fa-coins fa-lg", (btn, map) => {
    $("#currency").modal("show");
  }).addTo(map);

  var economy = L.easyButton("fa-solid fa-chart-simple fa-lg", (btn, map) => {
    $("#economy").modal("show");
  }).addTo(map);

  var news = L.easyButton("fa-solid fa-newspaper fa-lg", (btn, map) => {
    $("#news").modal("show");
  }).addTo(map);

  loadSelectCountries();

  // load user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(loadUserLocation);
  } else {
    alert("Device location not found!");
  }

  // on changing selected countries
  let countrySelect = $("#countrySelect");
  countrySelect.change(() => {
    // remove existing layers
    countryBorders.clearLayers();
    clearMarkers();
    clearPrevData();

    let iso_a2 = countrySelect.val();
    // console.log(iso_a2);

    highlightBorders(iso_a2);

    // find nearby cities
    $.ajax({
      url: "./libs/php/getCities.php",
      type: "GET",
      dataType: "json",
      data: { iso_a2 },
      success: ({ status, data }) => {
        if (status.name === "ok") {
          // console.log(data);
          for (item of data["geonames"]) {
            L.marker([item.lat, item.lng], { icon: cityIcon })
              .bindTooltip(
                "<div class='col text-center'><strong>" +
                  item.name +
                  "</strong><br><i>(" +
                  numeral(item.population).format("0,0") +
                  ")</i></div>",
                { direction: "top", sticky: true }
              )
              .addTo(cities);
          }
        }
      },
      error: function (err) {
        console.log(err);
      },
    });

    // find nearby airports
    $.ajax({
      url: "./libs/php/getAirports.php",
      type: "GET",
      dataType: "json",
      data: { iso_a2 },
      success: ({ status, data }) => {
        if (status.name === "ok") {
          // console.log(data);
          for (item of data["geonames"]) {
            L.marker([item.lat, item.lng], { icon: airportIcon })
              .bindTooltip(item.name, { direction: "top", sticky: true })
              .addTo(airports);
          }
        }
      },
      error: function (err) {
        console.log(err);
      },
    });

    // find nearby universities
    $.ajax({
      url: "./libs/php/getUniversities.php",
      type: "GET",
      dataType: "json",
      data: { iso_a2 },
      success: ({ status, data }) => {
        if (status.name === "ok") {
          // console.log(data);
          for (item of data["geonames"]) {
            L.marker([item.lat, item.lng], { icon: universityIcon })
              .bindTooltip(item.name, { direction: "top", sticky: true })
              .addTo(universities);
          }
        }
      },
      error: function (err) {
        console.log(err);
      },
    });

    // find nearby stadiums
    $.ajax({
      url: "./libs/php/getStadiums.php",
      type: "GET",
      dataType: "json",
      data: { iso_a2 },
      success: ({ status, data }) => {
        if (status.name === "ok") {
          // console.log(data);
          for (item of data["geonames"]) {
            L.marker([item.lat, item.lng], { icon: stadiumIcon })
              .bindTooltip(item.name, { direction: "top", sticky: true })
              .addTo(stadiums);
          }
        }
      },
      error: function (err) {
        console.log(err);
      },
    });

    // find nearby hospitals
    $.ajax({
      url: "./libs/php/getHospitals.php",
      type: "GET",
      dataType: "json",
      data: { iso_a2 },
      success: ({ status, data }) => {
        if (status.name === "ok") {
          // console.log(data);
          for (item of data["geonames"]) {
            L.marker([item.lat, item.lng], { icon: hospitalIcon })
              .bindTooltip(item.name, { direction: "top", sticky: true })
              .addTo(hospitals);
          }
        }
      },
      error: function (err) {
        console.log(err);
      },
    });

    // country info modal
    $.ajax({
      url: "./libs/php/getCountryInfo.php",
      type: "GET",
      dataType: "json",
      data: { iso_a2 },
      success: ({ status, data }) => {
        if (status.name === "ok") {
          // console.log(data);
          $("#country").html(data["geonames"][0]["countryName"]);
          $("#capital").html(data["geonames"][0]["capital"]);
          $("#population").html(
            numeral(data["geonames"][0]["population"]).format("0,0")
          );
          $("#area").html(
            numeral(data["geonames"][0]["areaInSqKm"]).format("0,0.0")
          );
          $("#continent").html(data["geonames"][0]["continentName"]);
        }

        var countryName = encodeURI(data["geonames"][0]["countryName"]);
        var iso_a3 = data["geonames"][0]["isoAlpha3"];
        var country = data["geonames"][0]["countryName"];
        var capital = data["geonames"][0]["capital"];

        // weather modal
        $("#weather").on("show.bs.modal", () => {
          getWeatherData(capital);
        });

        $("#weather").on("hidden.bs.modal", () => {
          $("#pre-load").removeClass("fadeOut");

          $("#modalLabel").html("");
          $("#todayConditions").html("");
          $("#todayIcon").attr("src", "");
          $("#todayMaxTemp").html("");
          $("#todayMinTemp").html("");

          $("#day1Date").text("");
          $("#day1Icon").attr("src", "");
          $("#day1MinTemp").text("");
          $("#day1MaxTemp").text("");

          $("#day2Date").text("");
          $("#day2Icon").attr("src", "");
          $("#day2MinTemp").text("");
          $("#day2MaxTemp").text("");

          $("#lastUpdated").text("");
        });

        // wikipedia modal
        $.ajax({
          url: "./libs/php/getCountryWiki.php",
          type: "GET",
          dataType: "json",
          data: { countryName },
          success: ({ status, data }) => {
            if (status.name === "ok") {
              // console.log(data);
              for (const iterator of data.geonames) {
                if (
                  iterator["feature"] === "country" &&
                  iterator["title"] === country
                ) {
                  // console.log(iterator);
                  $("#thumbnail").html(
                    "<img src='" +
                      iterator["thumbnailImg"] +
                      "' width='100px' height='100px'>"
                  );
                  $("#title").html(iterator["title"]);
                  $("#summary").html(iterator["summary"]);
                  $("#wikiUrl").html(
                    "<a href='https://" +
                      iterator["wikipediaUrl"] +
                      "' target='_blank'>Wikipedia Page...</a>"
                  );
                }
              }
            }
          },
          error: function (err) {
            console.log(err);
            $("#wiki .modal-title").replaceWith("Error retrieving data");
          },
        });

        // economy modal
        var period = $("#periodSelect").val();
        $("#economy").on("show.bs.modal", () => {
          getEcoData(iso_a3, period);
        });

        // on changing selected period
        $("#periodSelect").on("change", () => {
          let period = $("#periodSelect").val();
          getEcoData(iso_a3, period);
        });
      },
      error: function (err) {
        // console.log(err.responseText);
        $("#info .modal-title").text("Error retrieving data");
      },
    });

    //load currencies for conversion
    $.ajax({
      url: "./libs/php/getCurrencyData.php",
      type: "GET",
      dataType: "json",
      success: ({ status, data }) => {
        if (status.name === "ok") {
          // console.log(data);
          const fromCurr = $("#from");
          const toCurr = $("#to");

          // Function to create and add an <option> tag to the fromCurr element
          function createOptionTag(id, value, text) {
            const optionTag = $("<option>", {
              id: id,
              value: value,
              text: text,
            });
            fromCurr.append(optionTag);
          }
          // Loop through each inner list and create <option> tags
          for (const innerList of data) {
            for (let i = 0; i < innerList.length; i += 3) {
              const iso_a2 = innerList[i + 2];
              const currency_code = innerList[i];
              const currency_name = innerList[i + 1];
              createOptionTag(
                iso_a2,
                currency_code,
                currency_name + ", " + currency_code
              );
            }
          }
          // Sort the options based on their text
          const options = fromCurr.find("option");
          options.sort(function (a, b) {
            return a.text.localeCompare(b.text);
          });
          fromCurr.empty().append(options);

          const selectCountryOption = fromCurr.find("#" + iso_a2);
          if (selectCountryOption.length > 0) {
            toCurr.append(selectCountryOption.clone());
          }

          // for euro countries
          const euroOption = fromCurr.find("#EU");
          const euroCountries = [
            "AT",
            "BE",
            "CY",
            "EE",
            "FI",
            "FR",
            "DE",
            "GR",
            "IE",
            "IT",
            "LV",
            "LT",
            "LU",
            "MT",
            "NL",
            "PT",
            "SK",
            "SI",
            "ES",
          ];
          for (iterator of euroCountries) {
            if (iso_a2 === iterator) {
              toCurr.append(euroOption.clone());
            }
          }

          // for cfa franc countries
          const cfafrancOption = fromCurr.find("#XO");
          const cfafrancCountries = [
            "BJ",
            "BF",
            "CI",
            "GW",
            "ML",
            "NE",
            "SN",
            "TG",
            "CM",
            "CF",
            "TD",
            "CG",
            "GQ",
            "GA",
          ];
          for (iterator of cfafrancCountries) {
            if (iso_a2 === iterator) {
              toCurr.append(cfafrancOption.clone());
            }
          }
        }
      },
      error: function (err) {
        console.log(err.responseText);
      },
    });
    getNewsHeadlines(iso_a2);
  });
  fixEasyButtonSize(info);
  fixEasyButtonSize(wiki);
  fixEasyButtonSize(weather);
  fixEasyButtonSize(currency);
  fixEasyButtonSize(economy);
  fixEasyButtonSize(news);
});

// convert currency actions
$("#currency").on("show.bs.modal", () => {
  currConvert();
});

$("#fromAmount").on("keyup", () => {
  currConvert();
});

$("#fromAmount").on("change", () => {
  currConvert();
});

$("#from").on("change", () => {
  currConvert();
});

// load countries to select
function loadSelectCountries() {
  $.ajax({
    url: "./libs/php/getCountry.php",
    type: "GET",
    dataType: "json",
    success: ({ status, data }) => {
      if (status.name === "ok") {
        const options = $("#countrySelect");
        options.append(
          Object.entries(data)
            .sort()
            .map(([country, id]) => `<option value="${id}">${country}</option>`)
            .join("")
        );
      }
    },
    error: function (err) {
      console.log(err.responseText);
    },
  });
}

// get user location with country code
function loadUserLocation({ coords: { latitude, longitude } }) {
  // console.log(latitude);
  // console.log(longitude);

  $.ajax({
    url: "./libs/php/getCountryCode.php",
    type: "GET",
    dataType: "json",
    data: { latitude, longitude },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        countryCode = data.countryCode;
        $("#countrySelect").val(countryCode).change();
      }
    },
    error: function (err) {
      console.log(err.responseText);
    },
  });
}

// highlight country borders
function highlightBorders(iso_a2) {
  $.ajax({
    url: "./libs/php/getCountryBorders.php",
    type: "GET",
    dataType: "json",
    data: { iso_a2 },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        countryBorders.addData(data).setStyle(() => {
          return {
            color: "purple",
          };
        });
        map.fitBounds(countryBorders.getBounds());
      }
    },
    error: function (err) {
      console.log(err.responseText);
    },
  });
}

// currency converter
function currConvert() {
  let fromVal = $("#from").val();
  let toVal = $("#to").val();
  let amtVal = $("#fromAmount").val();

  $.ajax({
    url: "./libs/php/currencyConverter.php",
    type: "GET",
    dataType: "json",
    data: { fromVal, toVal, amtVal },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        const result = data["conversion_result"];
        $("#result").val(numeral(result).format("0,0.00"));
      }
    },
    error: function (err) {
      console.log(err.responseText);
    },
  });
}

function getWeatherData(capital) {
  $.ajax({
    url: "./libs/php/getCountryWeather.php",
    type: "GET",
    dataType: "json",
    data: { capital },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        if (data.forecast.forecastday.length !== 0) {
          // today
          $("#modalLabel").html(
            data["location"]["name"] + ", " + data["location"]["country"]
          );
          $("#todayConditions").html(
            data["forecast"]["forecastday"][0]["day"]["condition"]["text"]
          );
          $("#todayIcon").attr(
            "src",
            data["forecast"]["forecastday"][0]["day"]["condition"]["icon"]
          );
          $("#todayMaxTemp").html(
            addWeatherUnit(
              data["forecast"]["forecastday"][0]["day"]["maxtemp_c"]
            )
          );
          $("#todayMinTemp").html(
            addWeatherUnit(
              data["forecast"]["forecastday"][0]["day"]["mintemp_c"]
            )
          );

          // day 1
          $("#day1Date").text(
            dayjs(data["forecast"]["forecastday"][1]["date"]).format("ddd DD")
          );
          $("#day1Icon").attr(
            "src",
            data["forecast"]["forecastday"][1]["day"]["condition"]["icon"]
          );
          $("#day1MaxTemp").text(
            addWeatherUnit(
              data["forecast"]["forecastday"][1]["day"]["maxtemp_c"]
            )
          );
          $("#day1MinTemp").text(
            addWeatherUnit(
              data["forecast"]["forecastday"][1]["day"]["mintemp_c"]
            )
          );

          // day 2
          $("#day2Date").text(
            dayjs(data["forecast"]["forecastday"][2]["date"]).format("ddd DD")
          );
          $("#day2Icon").attr(
            "src",
            data["forecast"]["forecastday"][2]["day"]["condition"]["icon"]
          );
          $("#day2MaxTemp").text(
            addWeatherUnit(
              data["forecast"]["forecastday"][2]["day"]["maxtemp_c"]
            )
          );
          $("#day2MinTemp").text(
            addWeatherUnit(
              data["forecast"]["forecastday"][2]["day"]["mintemp_c"]
            )
          );
          $('#lastUpdated').text(dayjs(data.lastUpdated).format("HH:mm, DD MMM"));
          $("#pre-load").addClass("fadeOut");
        } else if (data.current) {
          // today
          $("#modalLabel").html(
            data["location"]["name"] + ", " + data["location"]["country"]
          );
          $("#todayConditions").html(data["current"]["condition"]["text"]);
          $("#todayIcon").attr("src", data["current"]["condition"]["icon"]);
          $("#todayMaxTemp").html(addWeatherUnit(data["current"]["temp_c"]));
          $("#todayMinTemp").html(
            addWeatherUnit(data["current"]["feelslike_c"])
          );
          $("#day1Date").text("Forecast Data Unavailable");
          $("#day2Date").text("Forecast Data Unavailable");
          $('#lastUpdated').text(dayjs(data.lastUpdated).format("HH:mm, DD MMM"));
          $("#pre-load").addClass("fadeOut");
        } else {
          $("#modalLabel").text("Weather Data Unavailable");
        }
      }
    },
    error: function (err) {
      // console.log(err);
      $("#modalLabel").text("Error retrieving data");
    },
  });
}

// load economic data
function getEcoData(iso_a3, period) {
  // nominal GDP
  $.ajax({
    url: "./libs/php/getCountryEconomy/getNominalGdp.php",
    type: "GET",
    dataType: "json",
    data: { iso_a3, period },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        $("#ngdp").html(numeral(data).format("0,0.00"));
      }
    },
    error: function (err) {
      console.log(err.responseText);
      $("#ngdp").html("N/A");
    },
  });

  // nominal GDP per capita
  $.ajax({
    url: "./libs/php/getCountryEconomy/getNominalGdpPC.php",
    type: "GET",
    dataType: "json",
    data: { iso_a3, period },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        $("#ngdppc").html(numeral(data).format("0,0.00"));
      }
    },
    error: function (err) {
      // console.log(err.responseText);
      $("#ngdppc").html("N/A");
    },
  });

  // real GDP growth
  $.ajax({
    url: "./libs/php/getCountryEconomy/getRealGdpGrowth.php",
    type: "GET",
    dataType: "json",
    data: { iso_a3, period },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        $("#rgdpgr").html(data);
      }
    },
    error: function (err) {
      // console.log(err.responseText);
      $("#rgdpgr").html("N/A");
    },
  });

  // inflation rate, CPI
  $.ajax({
    url: "./libs/php/getCountryEconomy/getCPI.php",
    type: "GET",
    dataType: "json",
    data: { iso_a3, period },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        $("#ircpi").html(data);
      }
    },
    error: function (err) {
      // console.log(err.responseText);
      $("#ircpi").html("N/A");
    },
  });

  // unemployment rate
  $.ajax({
    url: "./libs/php/getCountryEconomy/getUnemRate.php",
    type: "GET",
    dataType: "json",
    data: { iso_a3, period },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        $("#unemr").html(data);
      }
    },
    error: function (err) {
      // console.log(err.responseText);
      $("#unemr").html("N/A");
    },
  });

  // government revenue
  $.ajax({
    url: "./libs/php/getCountryEconomy/getGovtRev.php",
    type: "GET",
    dataType: "json",
    data: { iso_a3, period },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        $("#govtrev").html(data.toFixed(2));
      }
    },
    error: function (err) {
      // console.log(err.responseText);
      $("#govtrev").html("N/A");
    },
  });

  // government expenditure
  $.ajax({
    url: "./libs/php/getCountryEconomy/getGovtExp.php",
    type: "GET",
    dataType: "json",
    data: { iso_a3, period },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        $("#govtexp").html(data.toFixed(2));
      }
    },
    error: function (err) {
      // console.log(err.responseText);
      $("#govtexp").html("N/A");
    },
  });

  // government debt
  $.ajax({
    url: "./libs/php/getCountryEconomy/getGovtDebt.php",
    type: "GET",
    dataType: "json",
    data: { iso_a3, period },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        $("#govtdebt").html(data.toFixed(2));
      }
    },
    error: function (err) {
      // console.log(err.responseText);
      $("#govtdebt").html("N/A");
    },
  });
}

// news modal function
function getNewsHeadlines(iso_a2) {
  $.ajax({
    url: "./libs/php/getCountryNews.php",
    type: "GET",
    dataType: "json",
    data: { iso_a2 },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        if (data.results.length) {
          data.results.forEach((article) => {
            $("#newsTitle").append(
              "<table class='table table-borderless'><tr><td rowspan='2' width='50%'><img class='img-fluid rounded' src='" +
                article.image_url +
                "' alt='' title=''></td><td><a class='fw-bold fs-6 text-dark' href='" +
                article.link +
                "' target='_blank'>" +
                article.title +
                "</a></td></tr><tr><td class='align-bottom pb-0'><p class='fw-light fs-6 mb-1'>" +
                article.source_id +
                "</p><td></tr></table>"
            );
          });
        } else {
          $("#newsTitle").append("News from this country is unavailable.")
        }
      }
    },
    error: function (err) {
      console.log(err.responseText);
    },
  });
}

// clear previous data
function clearPrevData() {
  $("#ngdp").html("");
  $("#ngdppc").html("");
  $("#rgdpgr").html("");
  $("#ircpi").html("");
  $("#unemr").html("");
  $("#govtrev").html("");
  $("#govtexp").html("");
  $("#govtdebt").html("");
  $("#newsTitle").empty();
  $("#from").html("");
  $("#to").html("");
  $("#result").html("");
}

// clear all makers
function clearMarkers() {
  countryBorders.clearLayers();
  universities.clearLayers();
  stadiums.clearLayers();
  airports.clearLayers();
  cities.clearLayers();
  hospitals.clearLayers();
}

// format weather values
function addWeatherUnit(number) {
  return `${number}°c`;
}

// button display fix for iOS devices
function fixEasyButtonSize(button) {
  var buttonElement = button.button;
  buttonElement.style.padding = '0px';
  buttonElement.style.width = "26px";
  buttonElement.style.height = "26px";
  buttonElement.style.minWidth = "26px";
  buttonElement.style.minHeight = "26px";
}