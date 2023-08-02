//add tile and map
const tile = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

const map = L.map("map", {
  layers: [tile],
}).fitWorld();

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

  loadSelectCountries();

  // load user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(loadUserLocation);
  } else {
    alert("Device loaction not found!");
  }

  // remove existing layers
  function clearLayers() {
    map.eachLayer(function (layer) {
      if (layer instanceof L.geoJSON) {
        map.removeLayer(layer);
      }
    });
  }

  // on changing selected countries
  let countrySelect = document.getElementById("countrySelect");
  countrySelect.addEventListener("change", () => {
    // remove existing layers
    clearLayers();
    const index = countrySelect.selectedIndex;
    const selectCountry = countrySelect.options[index];
    let selectCountryId = selectCountry.value;
    
    highlightBorders(selectCountryId);

    // country info modal
    $.ajax({
      url: "./libs/php/getCountryInfo.php",
      type: "GET",
      dataType: "json",
      data: { selectCountryId },
      success: ({ status, data }) => {
        if (status.name === "ok") {
          console.log(data);
          $("#country").html(data["geonames"][0]["countryName"]);
          $("#capital").html(data["geonames"][0]["capital"]);
          $("#population").html(data["geonames"][0]["population"]);
          $("#area").html(data["geonames"][0]["areaInSqKm"]);
          $("#continent").html(data["geonames"][0]["continentName"]);
        }

        let countryName = encodeURI(data["geonames"][0]["countryName"]);
        console.log(countryName);
        // console.log(geonameId);
        // let north = data["geonames"][0]["north"];
        // let south = data["geonames"][0]["south"];
        // let east = data["geonames"][0]["east"];
        // let west = data["geonames"][0]["west"];

        // wikipedia modal
        $.ajax({
          url: "./libs/php/getCountryWiki.php",
          type: "GET",
          dataType: "json",
          data: { countryName },
          // data: { north, south, east, west },
          success: ({ status, data }) => {
            if (status.name === "ok") {
              console.log(data);
            }
          },
        });
        // weather modal
        // $.ajax({
        //   url: "./libs/php/getCountryWeather.php",
        //   type: "GET",
        //   dataType: "json",
        //   // data: { countryName },
        //   data: { north, south, east, west },
        //   success: ({ status, data }) => {
        //     if (status.name === "ok") {
        //       console.log(data);
        //     }
        //   },
        // });
      },
      error: (jqXHR) => {
        console.log(jqXHR.responseText);
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
    error: (jqXHR) => {
      console.log(jqXHR.responseText);
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
        console.log(countryCode);
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
    error: (jqXHR) => {
      console.log(jqXHR.responseText);
    },
  });
}

// highlight country borders
function highlightBorders(selectCountryId) {
  $.ajax({
    url: "./libs/php/getCountryBorders.php",
    type: "GET",
    dataType: "json",
    data: { selectCountryId },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        let countryBorders = L.geoJSON(data, {
          style: () => {
            return {
              color: "purple"
            }
          }
        }).addTo(map);
        map.fitBounds(countryBorders.getBounds());
      }
    },
    error: (jqXHR) => {
      console.log(jqXHR.responseText);
    },
  });
}

// reverse latitude and longitude array values
function latlngsReverse(array) {
  if (Array.isArray(array)) {
    return array.map(latlngsReverse).reverse();
  }
  return array;
}
