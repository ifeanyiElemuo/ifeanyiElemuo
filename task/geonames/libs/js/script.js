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
      success: (result) => {
        console.log(JSON.stringify(result));
  
        if (result.status.name == "ok") {
          $("#oceanName").html(result["data"]["ocean"]["name"]);
          $("#geonameId").html(result["data"]["ocean"]["geonameId"]);
        }
      },
      error: (jqXHR, textStatus, errorThrown) => {},
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
      success: (result) => {
        console.log(JSON.stringify(result));
  
        if (result.status.name == "ok") {
          $("#timezoneId").html(result["data"]["timezoneId"]);
          $("#tzCountryName").html(result["data"]["countryName"]);
          $("#countryCode").html(result["data"]["countryCode"]);
          $("#time").html(result["data"]["time"]);
          $("#sunrise").html(result["data"]["sunrise"]);
          $("#sunset").html(result["data"]["sunset"]);
        }
      },
      error: (jqXHR, textStatus, errorThrown) => {},
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
      success: (result) => {
        console.log(JSON.stringify(result));
  
        if (result.status.name == "ok") {
          $("#nearbyPlace").html(result["data"][0]["name"]);
          $("#fnpCountryName").html(result["data"][0]["countryName"]);
          $("#fnpDistance").html(result["data"][0]["distance"]);
        }
      },
      error: (jqXHR, textStatus, errorThrown) => {},
    });
  });  