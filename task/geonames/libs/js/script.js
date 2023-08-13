$(window).on("load", function () {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(1000)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
});

$("#ocnSubmit").click(() => {
  $.ajax({
    url: "./libs/php/ocean.php",
    type: "POST",
    datatype: "json",
    data: {
      lat: $("#ocnLat").val(),
      lng: $("#ocnLng").val(),
    },
    success: ({ status, data }) => {
      // console.log(data);

      if (status.name === "ok") {
        if (data.ocean) {
          $("#oceanName").html(data["ocean"]["name"]);
          $("#geonameId").html(data["ocean"]["geonameId"]);
        } else {
          $("#oceanName").html("No ocean found");
          $("#geonameId").html("N/A");
        }
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
});

$("#tzSubmit").click(() => {
  $.ajax({
    url: "./libs/php/timezone.php",
    type: "POST",
    datatype: "json",
    data: {
      lat: $("#tzLat").val(),
      lng: $("#tzLng").val(),
    },
    success: ({status, data}) => {
      // console.log(data);

      if (status.name == "ok") {
        $("#timezoneId").html(data["timezoneId"]);
        $("#tzCountryName").html(data["countryName"]);
        $("#countryCode").html(data["countryCode"]);
        $("#time").html(data["time"]);
        $("#sunrise").html(data["sunrise"]);
        $("#sunset").html(data["sunset"]);
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
});

$("#fnpSubmit").click(() => {
  $.ajax({
    url: "./libs/php/findNearbyPlace.php",
    type: "POST",
    datatype: "json",
    data: {
      lat: $("#fnpLat").val(),
      lng: $("#fnpLng").val(),
    },
    success: ({status, data}) => {
      // console.log(data);

      if (status.name == "ok") {
        $("#nearbyPlace").html(data[0]["name"]);
        $("#fnpCountryName").html(data[0]["countryName"]);
        $("#fnpDistance").html(data[0]["distance"]);
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
});
