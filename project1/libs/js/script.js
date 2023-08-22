//add tile and map
const tile = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

const map = L.map("map", {
  layers: [tile],
}).fitWorld();

// border outline
var countryBorders = L.geoJSON().addTo(map);

// markers
var markers = L.markerClusterGroup();

var placeIcon = L.icon({
  iconUrl: './libs/img/place.png',
  shadowUrl: './libs/img/shadow.png',
  popupAnchor: [15, 3],
});

$(window).on("load", () => {
  L.easyButton("button fa-solid fa-circle-info fa-xl", (btn, map) => {
    $("#info").modal("show");
  }).addTo(map);

  L.easyButton("button fa-solid fa-globe fa-xl", (btn, map) => {
    $("#wiki").modal("show");
  }).addTo(map);

  L.easyButton("button fa-solid fa-cloud-sun-rain fa-xl", (btn, map) => {
    $("#weather").modal("show");
  }).addTo(map);

  L.easyButton("button fa-solid fa-coins fa-xl", (btn, map) => {
    $("#currency").modal("show");
  }).addTo(map);

  L.easyButton("button fa-solid fa-chart-simple fa-xl", (btn, map) => {
    $("#economy").modal("show");
  }).addTo(map);

  L.easyButton("button fa-solid fa-newspaper fa-xl", (btn, map) => {
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
    markers.clearLayers();
    clearPrevData();

    let iso_a2 = countrySelect.val();
    // console.log(iso_a2);

    highlightBorders(iso_a2);
    getNewsHeadlines(iso_a2);

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
            thousandSeparator(data["geonames"][0]["population"])
          );
          $("#area").html(thousandSeparator(data["geonames"][0]["areaInSqKm"]));
          $("#continent").html(data["geonames"][0]["continentName"]);
        }

        var countryName = encodeURI(data["geonames"][0]["countryName"]);
        var iso_a3 = data["geonames"][0]["isoAlpha3"];
        var country = data["geonames"][0]["countryName"];
        var north = data["geonames"][0]["north"];
        var south = data["geonames"][0]["south"];
        var east = data["geonames"][0]["east"];
        var west = data["geonames"][0]["west"];

        // find nearby cities
        $.ajax({
          url: "./libs/php/getCities.php",
          type: "GET",
          dataType: "json",
          data: { north, south, east, west },
          success: ({ status, data }) => {
            if (status.name === "ok") {
              // console.log(data);
              const places = [];
              for (iterator of data["geonames"]) {
                var latitude = iterator["lat"];
                var longitude = iterator["lng"];
                var name = iterator["name"];
                var place = new Array(latitude, longitude, name);
                places.push(place);

                // weather modal
                $.ajax({
                  url: "./libs/php/getCountryWeather.php",
                  type: "GET",
                  dataType: "json",
                  data: { latitude, longitude },
                  success: ({ status, data }) => {
                    if (status.name === "ok") {
                      // console.log(data);
                      $("#temp").html(data["main"]["temp"]);
                      $("#tempMin").html(data["main"]["temp_min"]);
                      $("#tempMax").html(data["main"]["temp_max"]);
                      $("#humidity").html(data["main"]["humidity"]);
                      $("#weatherMain").html(data["weather"][0]["main"]);
                      $("#weatherDesc").html(
                        data["weather"][0]["description"]
                      );
                      $("#windDeg").html(data["wind"]["deg"]);
                      $("#windGust").html(data["wind"]["gust"]);
                      $("#windSpeed").html(data["wind"]["speed"]);
                    }
                  },
                  error: function (err) {
                    console.log(err);
                  },
                });
              }
              // console.log(places);
              // adding markers for nearby cities
              for (iterator of places) {
                var placeName = iterator[2];
                var marker = L.marker(new L.LatLng(iterator[0], iterator[1]), {
                  icon: placeIcon
                });
                marker.bindPopup(placeName);
                markers.addLayer(marker);
              }
              map.addLayer(markers);
            }
          },
          error: function (err) {
            console.log(err);
          },
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
                      "' target='_blank'>Read more...</a>"
                  );
                }
              }
            }
          },
          error: function (err) {
            console.log(err);
          },
        });

        // economy modal
        // on changing selected period
        let periodSelect = $("#periodSelect");
        periodSelect.change(() => {
          let period = periodSelect.val();

          // nominal GDP
          $.ajax({
            url: "./libs/php/getCountryEconomy/getNominalGdp.php",
            type: "GET",
            dataType: "json",
            data: { iso_a3, period },
            success: ({ status, data }) => {
              if (status.name === "ok") {
                // console.log(data);
                const result = data.toFixed(2);
                $("#ngdp").html(thousandSeparator(result));
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
                const result = data.toFixed(2);
                $("#ngdppc").html(thousandSeparator(result));
              }
            },
            error: function (err) {
              console.log(err.responseText);
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
              console.log(err.responseText);
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
              console.log(err.responseText);
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
              console.log(err.responseText);
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
              console.log(err.responseText);
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
              console.log(err.responseText);
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
              console.log(err.responseText);
              $("#govtdebt").html("N/A");
            },
          });
        });
      },
      error: function (err) {
        console.log(err.responseText);
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
          const euroCountries = ["AT", "BE", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT",
          "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES"];
          for (iterator of euroCountries) {
            if (iso_a2 === iterator) {
              toCurr.append(euroOption.clone());
            }
          }
          
          // for cfa franc countries
          const cfafrancOption = fromCurr.find("#XO");
          const cfafrancCountries = ["BJ", "BF", "CI", "GW", "ML", "NE", "SN", "TG", "CM", "CF", "TD", "CG", "GQ", "GA"];
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
  });

  // currency converter
  const convert = $("#convert");
  convert.click(() => {
    let fromVal = $("#from").val();
    let toVal = $("#to").val();
    let amtVal = $("#amount").val();

    $.ajax({
      url: "./libs/php/currencyConverter.php",
      type: "GET",
      dataType: "json",
      data: { fromVal, toVal, amtVal },
      success: ({ status, data }) => {
        if (status.name === "ok") {
          // console.log(data);
          const result = data["conversion_result"].toFixed(2);
          $("#result").html(thousandSeparator(result));
        }
      },
      error: function (err) {
        console.log(err.responseText);
      },
    });
  });
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
        for (iterator of data.articles) {
          $("#newsTitle").append(
            "<div><h5 class='card-title'>" +
              iterator["title"] +
              "</h5><a href=" +
              iterator["url"] +
              "' target='_blank'>Read more...</a><br><br></div>"
          );
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
  $("#newsTitle").html("");
  $("#from").html("");
  $("#to").html("");
  $("#result").html("");
}

// add comma every thousandth digit
function thousandSeparator(number) {
  const parts = number.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
