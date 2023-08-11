//add tile and map
const tile = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

const map = L.map("map", {
  layers: [tile],
}).fitWorld();

let countryBorders = L.geoJSON().addTo(map);

$(window).on("load", function () {
  const countryInfo = L.easyButton(
    "fa-solid fa-circle-info",
    function (btn, map) {
      $("#info").modal("show");
    }
  ).addTo(map);

  const countryWiki = L.easyButton("fa-solid fa-globe", function (btn, map) {
    $("#wiki").modal("show");
  }).addTo(map);

  const countryWeather = L.easyButton(
    "fa-solid fa-question",
    function (btn, map) {
      $("#weather").modal("show");
    }
  ).addTo(map);

  const countryCurrency = L.easyButton(
    "fa-solid fa-question",
    function (btn, map) {
      $("#currency").modal("show");
    }
  ).addTo(map);

  const countryEconomy = L.easyButton(
    "fa-solid fa-question",
    function (btn, map) {
      $("#economy").modal("show");
    }
  ).addTo(map);

  const countryNews = L.easyButton("fa-solid fa-question", function (btn, map) {
    $("#news").modal("show");
  }).addTo(map);

  loadSelectCountries();
  loadSelectCurrencies();

  // load user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(loadUserLocation);
  } else {
    alert("Device loaction not found!");
  }

  // on changing selected countries
  let countrySelect = document.getElementById("countrySelect");
  countrySelect.addEventListener("change", () => {
    // remove existing layers
    countryBorders.clearLayers();
    clearNewsData();
    clearEcoData();

    let selectCountryVal = countrySelect.value;

    highlightBorders(selectCountryVal);
    getNewsHeadlines(selectCountryVal);

    // country info modal
    $.ajax({
      url: "./libs/php/getCountryInfo.php",
      type: "GET",
      dataType: "json",
      data: { selectCountryVal },
      success: ({ status, data }) => {
        if (status.name === "ok") {
          // console.log(data);
          $("#country").html(data["geonames"][0]["countryName"]);
          $("#capital").html(data["geonames"][0]["capital"]);
          $("#population").html(data["geonames"][0]["population"]);
          $("#area").html(data["geonames"][0]["areaInSqKm"]);
          $("#continent").html(data["geonames"][0]["continentName"]);
        }

        let countryName = encodeURI(data["geonames"][0]["countryName"]);
        let iso_a3 = data["geonames"][0]["isoAlpha3"];
        let country = data["geonames"][0]["countryName"];

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

                  const latitude = iterator["lat"];
                  const longitude = iterator["lng"];
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
              }
            }
          },
          error: function (err) {
            console.log(err);
          },
        });

        // economy modal
        // on changing selected period
        let periodSelect = document.getElementById("periodSelect");
        periodSelect.addEventListener("change", () => {
          const periodIndex = periodSelect.selectedIndex;
          const selectPeriod = periodSelect.options[periodIndex];
          let period = selectPeriod.value;

          // nominal GDP
          $.ajax({
            url: "./libs/php/getCountryEconomy/getNominalGdp.php",
            type: "GET",
            dataType: "json",
            data: { iso_a3, period },
            success: ({ status, data }) => {
              if (status.name === "ok") {
                // console.log(data);
                $("#ngdp").html(data);
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
                $("#ngdppc").html(data);
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
                $("#govtrev").html(data);
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
                $("#govtexp").html(data);
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
                $("#govtdebt").html(data);
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
  });

  // currency converter
  const from = document.getElementById("from");
  const to = document.getElementById("to");
  const amount = document.getElementById("amount");
  const convert = document.getElementById("convert");
  const result = document.getElementById('result');
  convert.addEventListener("click", () => {
    let fromVal = from.value;
    let toVal = to.value;
    let amtVal = amount.value;
    console.log(amtVal);
    $.ajax({
      url: "./libs/php/currencyConverter.php",
      type: "GET",
      dataType: "json",
      data: { fromVal, toVal, amtVal },
      success: ({ status, data }) => {
        if (status.name === "ok") {
          console.log(data);
          $("#result").html(data['conversion_result']);
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

// load currencies to select
function loadSelectCurrencies() {
  $.ajax({
    url: "./libs/php/getCurrencyData.php",
    type: "GET",
    dataType: "json",
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        const fromCurr = $("#from");
        const toCurr = $("#to");
        fromCurr.append(
          Object.entries(data.codes)
            .sort()
            .map(
              ([currency, code]) =>
                `<option value="${code}">${currency}, ${code}</option>`
            )
            .join("")
        );
        toCurr.append(
          Object.entries(data.codes)
            .sort()
            .map(
              ([currency, code]) =>
                `<option value="${code}">${currency}, ${code}</option>`
            )
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
        // console.log(countryCode);
        let countrySelect = document.getElementById("countrySelect");
        countrySelect.id = countryCode;
        for (let i = 0; i < countrySelect.options.length; i++) {
          if (countrySelect.options[i].value === countrySelect.id) {
            countrySelect.selectedIndex = i;
            return;
          }
        }
        $("#countrySelect").val(countryCode).change();
      }
    },
    error: function (err) {
      console.log(err.responseText);
    },
  });
}

// highlight country borders
function highlightBorders(selectCountryVal) {
  $.ajax({
    url: "./libs/php/getCountryBorders.php",
    type: "GET",
    dataType: "json",
    data: { selectCountryVal },
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
function getNewsHeadlines(selectCountryVal) {
  $.ajax({
    url: "./libs/php/getCountryNews.php",
    type: "GET",
    dataType: "json",
    data: { selectCountryVal },
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

// clear country news
function clearNewsData() {
  $("#newsTitle").html("");
}

function clearEcoData() {
  $("#ngdp").html("");
  $("#ngdppc").html("");
  $("#rgdpgr").html("");
  $("#ircpi").html("");
  $("#unemr").html("");
  $("#govtrev").html("");
  $("#govtexp").html("");
  $("#govtdebt").html("");
}
