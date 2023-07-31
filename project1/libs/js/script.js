$(window).on("load", function () {
  //add tile and map
  const tile = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });

  const map = L.map("map", {
    layers: [tile],
  }).fitWorld();

  const countryInfo = L.easyButton("fa-solid fa-circle-info", function (btn, map) {
    $("#info").modal("show");
  }).addTo(map);

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
      if (layer instanceof L.Polygon) {
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
    let selectCountryId = selectCountry.id;
    // highlight country borders
    $.ajax({
      url: "./libs/php/getCountryBorders.php",
      type: "GET",
      dataType: "json",
      success: ({ status, data }) => {
        if (status.name === "ok") {
          // console.log(data)
          const coords = data[selectCountryId];
          // reverse array of latitude and longitutde values to display borders correctly
          const latlngs = latlngsReverse(coords);
          const polygon = L.polygon(latlngs, { color: "purple" }).addTo(map);
          map.fitBounds(polygon.getBounds());
        }
      },
      error: (jqXHR) => {
        console.log(jqXHR.responseText);
      },
    });

    // country info modal
    $.ajax({
      url: "./libs/php/getCountryInfo.php",
      type: "GET",
      dataType: "json",
      data: { selectCountryId },
      success: ({ status, data }) => {
        if (status.name === "ok") {
          // console.log(data)
          $("#country").html(data["geonames"][0]["countryName"]);
          $("#capital").html(data["geonames"][0]["capital"]);
          $("#population").html(data["geonames"][0]["population"]);
          $("#area").html(data["geonames"][0]["areaInSqKm"]);
          $("#continent").html(data["geonames"][0]["continentName"]);
        }
        // wikipedia modal
        let countryName = data["geonames"][0]["countryName"];
        $.ajax({
          url: "./libs/php/getCountryWiki.php",
          type: "GET",
          dataType: "json",
          data: { countryName },
          success: ({ status, data }) => {
            if (status.name === "ok") {
              console.log(data);
              
            }
          }
        })
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
            .map(([country, id]) => `<option id="${id}">${country}</option>`)
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
        const countryCode = data.countryCode;
        // console.log(countryCode);
        let countrySelect = document.getElementById("countrySelect");
        countrySelect.id = countryCode;
        for (let i = 0; i < countrySelect.options.length; i++) {
          if (countrySelect.options[i].id === countrySelect.id) {
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
// reverse latitude and longitude array values
function latlngsReverse(array) {
  if (Array.isArray(array)) {
    return array.map(latlngsReverse).reverse();
  }
  return array;
}
