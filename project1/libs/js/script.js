$(window).on("load", function () {
  const tile = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });

  const map = L.map("map", {
    layers: [tile],
  }).fitWorld();

  // load countries to select
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

  

});
