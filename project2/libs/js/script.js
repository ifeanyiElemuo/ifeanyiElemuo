$(window).on("load", () => {
  referesh();
});

$(document).ready(function () {
  // clear search input
  $("#personnelBtn").click(() => {
    $("#searchInputForm")[0].reset();
    getAllPersonnel();
  });

  $("#departmentsBtn").click(() => {
    $("#searchInputForm")[0].reset();
    getAllDepartments();
  });

  $("#locationsBtn").click(() => {
    $("#searchInputForm")[0].reset();
    getAllLocations();
  });

  // to search personnel, departments, and locations
  $("#searchInput").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#personnelTable tr ").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
    $("#deptTable tr ").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
    $("#locationsTable tr ").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });

  // referesh directory
  $("#refreshBtn").click(() => {
    referesh();
  });
});

// ---- personnel CRUD functions ---
// add new personnel
$("#newPersonnelForm").submit(function (event) {
  event.preventDefault(); // prevents form submitting

  // get form inputs
  var firstName = $("#newPersonnelFirstName").val();
  var lastName = $("#newPersonnelLastName").val();
  var jobTitle = $("#newPersonnelJobTitle").val();
  var email = $("#newPersonnelEmailAddress").val();
  var departmentID = $("#newPersonnelDepartment").val();

  $.ajax({
    url: "./libs/php/insertPersonnel.php",
    type: "POST",
    data: { firstName, lastName, jobTitle, email, departmentID },
    success: ({ status }) => {
      if (status.name === "ok") {
        referesh();
        $("#alertMessage").html("<p>New personnel added!</p>");
        $("#newPersonnelForm")[0].reset();
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      $("#alertMessage").html("<p>Error adding new personnel!</p>");
    },
  });
});

// get personnel by ID
function getPersonnelByID(id) {
  return $.ajax({
    url: "./libs/php/getPersonnelByID.php",
    type: "GET",
    dataType: "json",
    data: { id },
  })
    .then(({ status, data }) => {
      if (status.name === "ok") {
        return data;
      } else throw new Error("Failed to fetch personnel data");
    })
    .catch((error) => {
      console.log(error.responseText);
      throw error;
    });
}

// get all personnel
function getAllPersonnel() {
  $("#personnelTable").html("");
  showSpinner();
  $.ajax({
    url: "./libs/php/getAll.php",
    type: "GET",
    dataType: "json",
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        data.forEach((person) => {
          $("#personnelTable").append(
            "<tr><td class='align-middle text-nowrap'>" +
              person.lastName +
              ", " +
              person.firstName +
              "</td><td class='align-middle text-nowrap d-none d-md-table-cell'>" +
              person.department +
              "</td><td class='align-middle text-nowrap d-none d-md-table-cell'>" +
              person.location +
              "</td><td class='align-middle text-nowrap d-none d-md-table-cell'>" +
              person.email +
              "</td><td class='text-end text-nowrap'><button type='button' class='btn btn-info btn-sm editPersonnelBtn' data-bs-toggle='modal' data-bs-target='#editPersonnelModal' data-id='" +
              person.id +
              "' dept-id='" +
              person.departmentID +
              "'><i class='fa-solid fa-pencil fa-fw'></i></button>&nbsp;<button type='button' class='btn btn-danger btn-sm deletePersonnelBtn' data-bs-toggle='modal' data-bs-target='#deletePersonnelModal' data-id='" +
              person.id +
              "'><i class='fa-solid fa-trash fa-fw'></i></button></td></tr>"
          );
        });

        // to edit personnel data
        $(".editPersonnelBtn").click(function () {
          // fills form with selected personnel data
          var id = $(this).attr("data-id");
          getPersonnelByID(id)
            .then((data) => {
              //   console.log(data);
              var person = data.personnel[0];
              $("#editPersonnelID").val(person.id);
              $("#editPersonnelFirstName").val(person.firstName);
              $("#editPersonnelLastName").val(person.lastName);
              $("#editPersonnelEmailAddress").val(person.email);
              $("#editPersonnelJobTitle").val(person.jobTitle);
            })
            .catch((error) => {
              console.log(error);
            });
          // select personnel department option from dropdown
          $("#editPersonnelDepartment").val($(this).attr("dept-id"));
        });

        // to delete personnel data
        $(".deletePersonnelBtn").click(function () {
          var id = $(this).attr("data-id");
          getPersonnelByID(id)
            .then((data) => {
              //   console.log(data);
              var person = data.personnel[0];
              $("#deletePersonnelID").val(person.id);
              $("#deletePersonnelForm").append(
                "<p id='deletePersonnelPrompt'>Are you sure you want to delete <strong>" +
                  person.lastName +
                  ", " +
                  person.firstName +
                  "</strong> from the personnel directory?</p>"
              );
            })
            .catch((error) => {
              console.log(error);
            });
        });
      }
      hideSpinner();
    },
    error: function (err) {
      console.log(err);
    },
  });
}

// edit personnel by ID
$("#editPersonnelForm").submit(function (event) {
  event.preventDefault(); // prevents form submitting

  // get form inputs
  var firstName = $("#editPersonnelFirstName").val();
  var lastName = $("#editPersonnelLastName").val();
  var jobTitle = $("#editPersonnelJobTitle").val();
  var email = $("#editPersonnelEmailAddress").val();
  var departmentID = $("#editPersonnelDepartment").val();
  var editPersonnelID = $("#editPersonnelID").val();

  $.ajax({
    url: "./libs/php/editPersonnelByID.php",
    type: "POST",
    data: {
      firstName,
      lastName,
      jobTitle,
      email,
      departmentID,
      editPersonnelID,
    },
    success: ({ status }) => {
      if (status.name === "ok") {
        referesh();
        $("#alertMessage").html("<p>Updated personnel data successfully!</p>");
        $("#editPersonnelForm")[0].reset();
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      $("#alertMessage").html("<p>Error updating personnel data!</p>");
    },
  });
});

// delete personnel by ID
$("#deletePersonnelForm").submit(function (event) {
  event.preventDefault(); // prevents form submitting

  var personnelID = $("#deletePersonnelID").val();
  $.ajax({
    url: "./libs/php/deletePersonnelByID.php",
    type: "POST",
    data: { personnelID },
    success: ({ status }) => {
      if (status.name === "ok") {
        // console.log(data);
        referesh();
        $("#alertMessage").html("<p>Personnel deleted successfully!</p>");
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      $("#alertMessage").html("<p>Error deleting personnel!</p>");
    },
  });
  $("#deletePersonnelID").empty();
  $("p").remove("#deletePersonnelPrompt");
});

// ---- department CRUD functions ---
// add new department
$("#newDepartmentForm").submit(function (event) {
  event.preventDefault(); // prevents form submitting

  // get form inputs
  var name = $("#newDepartmentName").val();
  var locationID = $("#newDepartmentLocation").val();

  $.ajax({
    url: "./libs/php/insertDepartment.php",
    type: "POST",
    data: { name, locationID },
    success: ({ status }) => {
      if (status.name === "ok") {
        referesh();
        $("#alertMessage").html("<p>New department added!</p>");
        $("#newDepartmentForm")[0].reset();
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err);
      $("#alertMessage").html("<p>Error adding new department!</p>");
    },
  });
});

// get department by ID
function getDepartmentByID(id) {
  return $.ajax({
    url: "./libs/php/getDepartmentByID.php",
    type: "GET",
    dataType: "json",
    data: { id },
  })
    .then(({ status, data }) => {
      if (status.name === "ok") {
        return data;
      }
      throw new Error("Failed to fetch department data");
    })
    .catch((error) => {
      console.log(error.responseText);
      throw error;
    });
}

// get all departments
function getAllDepartments() {
  $("#deptTable").html("");
  $.ajax({
    url: "./libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        data.forEach((department) => {
          $("#deptTable").append(
            "<tr><td class='align-middle text-nowrap'>" +
              department.name +
              "</td>" +
              "<td class='align-middle text-nowrap d-none d-md-table-cell'>" +
              department.location +
              "</td>" +
              "<td class='align-middle text-end text-nowrap'><button type='button' class='btn btn-info btn-sm editDepartmentBtn' data-bs-toggle='modal' data-bs-target='#editDepartmentModal' data-id='" +
              department.id +
              "' location-id='" +
              department.locationID +
              "'><i class='fa-solid fa-pencil fa-fw'></i></button>&nbsp;<button type='button' class='btn btn-danger btn-sm deleteDepartmentBtn' data-bs-toggle='modal' data-bs-target='#deleteDepartmentModal' data-id='" +
              department.id +
              "'><i class='fa-solid fa-trash fa-fw'></i></button></td></tr>"
          );
        });

        $(".editDepartmentBtn").click(function () {
          // fills form with selected department name
          var id = $(this).attr("data-id");
          getDepartmentByID(id)
            .then((data) => {
              //   console.log(data);
              var department = data[0];
              $("#editDepartmentID").val(department.id);
              $("#editDepartmentName").val(department.name);
            })
            .catch((error) => {
              console.log(error.responseText);
            });
          //selects department location from dropdown
          $("#editDepartmentLocation").val($(this).attr("location-id"));
        });

        // to delete department
        // get department employee count by ID
        $(".deleteDepartmentBtn").click(function () {
          var id = $(this).attr("data-id");
          $.ajax({
            url: "./libs/php/getPersonnelCountByID.php",
            type: "GET",
            dataType: "json",
            data: { id },
          })
            .then(({ status, data }) => {
              if (status.name === "ok") {
                // console.log(data);
                var departmentID = data[0].id;
                var personnelCount = data[0].personnelCount;
                var departmentName = data[0].departmentName;

                $("#deleteDepartmentID").val(departmentID);

                if (personnelCount > 0) {
                  $("#delDeptModalTitle").text("Request denied!");
                  $("#deleteDeptFooter").hide();
                  $("#deleteDepartmentForm").append(
                    "<p id='deleteDepartmentPrompt'><strong>" +
                      departmentName +
                      "</strong> has <strong>" +
                      personnelCount +
                      "</strong> employee(s) and cannot be deleted!</p>"
                  );
                } else {
                  $("#delDeptModalTitle").text("Delete department?");
                  $("#deleteDeptFooter").show();
                  $("#deleteDepartmentForm").append(
                    "<p id='deleteDepartmentPrompt'>Are you sure you want to delete <strong>" +
                      departmentName +
                      "</strong> from the directory?</p>"
                  );
                }
              } else throw new Error("Failed to fetch personnel count");
            })
            .catch((error) => {
              console.log(error);
              throw error;
            });
        });
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
}

// edit department by ID
$("#editDepartmentForm").submit(function (event) {
  event.preventDefault(); // prevents form submitting

  // get form inputs
  var departmentID = $("#editDepartmentID").val();
  var departmentName = $("#editDepartmentName").val();
  var locationID = $("#editDepartmentLocation").val();

  $.ajax({
    url: "./libs/php/editDepartmentByID.php",
    type: "POST",
    data: { departmentID, departmentName, locationID },
    success: ({ status }) => {
      if (status.name === "ok") {
        referesh();
        $("#alertMessage").html("<p>Updated department data successfully!</p>");
        $("#editDepartmentForm")[0].reset();
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      $("#alertMessage").html("<p>Error updating department data!</p>");
    },
  });
});

// delete department by ID
$("#deleteDepartmentForm").submit(function (event) {
  event.preventDefault(); // prevents form submitting

  // get form input
  var departmentID = $("#deleteDepartmentID").val();

  $.ajax({
    url: "./libs/php/deleteDepartmentByID.php",
    type: "POST",
    data: { departmentID },
    success: ({ status }) => {
      if (status.name === "ok") {
        //   console.log(data);
        referesh();
        $("#alertMessage").html("<p>Department deleted successfully!</p>");
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      $("#alertMessage").html("<p>Error deleting department!</p>");
    },
  });
  $("#deleteDepartmentID").empty();
  $("p").remove("#deleteDepartmentPrompt");
});

// ---- location CRUD functions ---
// add new location
$("#newLocationForm").submit(function (event) {
  event.preventDefault(); // prevents form submitting

  // get form inputs
  var name = $("#newLocationName").val();

  $.ajax({
    url: "./libs/php/insertLocation.php",
    type: "POST",
    data: { name },
    success: ({ status }) => {
      if (status.name === "ok") {
        referesh();
        $("#alertMessage").html("<p>New location added!</p>");
        $("#newLocationForm")[0].reset();
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      $("#alertMessage").html("<p>Error adding new location!</p>");
    },
  });
});

// get all locations
function getAllLocations() {
  $("#locationsTable").html("");
  $.ajax({
    url: "./libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        data.forEach((location) => {
          $("#locationsTable").append(
            "<tr><td class='align-middle text-nowrap'>" +
              location.name +
              "</td><td class='align-middle text-end text-nowrap'><button type='button' class='btn btn-info btn-sm editLocationBtn' data-bs-toggle='modal' data-bs-target='#editLocationModal' data-id='" +
              location.id +
              "'><i class='fa-solid fa-pencil fa-fw'></i></button>&nbsp;<button type='button' class='btn btn-danger btn-sm deleteLocationBtn' data-bs-toggle='modal' data-bs-target='#deleteLocationModal' data-id='" +
              location.id +
              "'><i class='fa-solid fa-trash fa-fw'></i></button></td></tr>"
          );
        });

        //to edit location
        $(".editLocationBtn").click(function () {
          // fills form with selected location name
          var id = $(this).attr("data-id");
          getLocationByID(id)
            .then((data) => {
              //   console.log(data);
              var location = data[0];
              $("#editLocationID").val(location.id);
              $("#editLocationName").val(location.name);
            })
            .catch((error) => {
              console.log(error.responseText);
            });
        });

        // to delete location
        $(".deleteLocationBtn").click(function () {
          var id = $(this).attr("data-id");
          $.ajax({
            url: "./libs/php/getDepartmentCountByID.php",
            type: "GET",
            dataType: "json",
            data: { id },
          })
            .then(({ status, data }) => {
              if (status.name === "ok") {
                // console.log(data);
                var locationID = data[0].id;
                var departmentCount = data[0].departmentCount;
                var locationName = data[0].locationName;

                $("#deleteLocationID").val(locationID);

                if (departmentCount > 0) {
                  $("#deleteLocModalTitle").text("Request denied!");
                  $("#deleteLocFooter").hide();
                  $("#deleteLocationForm").append(
                    "<p id='deleteLocationPrompt'><strong>" +
                      locationName +
                      "</strong> has <strong>" +
                      departmentCount +
                      "</strong> department(s) and cannot be deleted!</p>"
                  );
                } else {
                  $("#deleteLocModalTitle").text("Delete location?");
                  $("#deleteLocFooter").show();
                  $("#deleteLocationForm").append(
                    "<p id='deleteLocationPrompt'>Are you sure you want to delete <strong>" +
                      locationName +
                      "</strong> from the directory?</p>"
                  );
                }
              } else throw new Error("Failed to fetch department count");
            })
            .catch((error) => {
              console.log(error);
              throw error;
            });
        });
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
}

// get location by ID
function getLocationByID(id) {
  return $.ajax({
    url: "./libs/php/getLocationByID.php",
    type: "GET",
    dataType: "json",
    data: { id },
  })
    .then(({ status, data }) => {
      if (status.name === "ok") {
        return data;
      }
      throw new Error("Failed to fetch location data");
    })
    .catch((error) => {
      console.log(error.responseText);
      throw error;
    });
}

// edit location by ID
$("#editLocationForm").submit(function (event) {
  event.preventDefault(); // prevents form submitting

  // get form inputs
  var locationID = $("#editLocationID").val();
  var locationName = $("#editLocationName").val();

  $.ajax({
    url: "./libs/php/editLocationByID.php",
    type: "POST",
    data: { locationID, locationName },
    success: ({ status }) => {
      if (status.name === "ok") {
        referesh();
        $("#alertMessage").html("<p>Updated location data successfully!</p>");
        $("#editLocationForm")[0].reset();
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      $("#alertMessage").html("<p>Error updating location data!</p>");
    },
  });
});

// delete location by ID
$("#deleteLocationForm").submit(function (event) {
  event.preventDefault(); // prevents form submitting

  // get form input
  var locationID = $("#deleteLocationID").val();

  $.ajax({
    url: "./libs/php/deleteLocationByID.php",
    type: "POST",
    data: { locationID },
    success: ({ status }) => {
      if (status.name === "ok") {
        //   console.log(data);
        referesh();
        $("#alertMessage").html("<p>Location deleted successfully!</p>");
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      $("#alertMessage").html("<p>Error deleting location!</p>");
    },
  });
  $("#deleteLocationID").empty();
  $("p").remove("#deleteLocationPrompt");
});

// ------ helper functions ------
// populate departments dropdowns
function populateDeptDropdown() {
  $.ajax({
    url: "./libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        data.forEach((department) => {
          $("#newPersonnelDepartment").append(
            "<option value='" +
              department.id +
              "'>" +
              department.name +
              "</option>"
          );

          $("#editPersonnelDepartment").append(
            "<option value='" +
              department.id +
              "'>" +
              department.name +
              "</option>"
          );
        });
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
}

// populate locations dropdown
function populateLocationsDropdown() {
  $.ajax({
    url: "./libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        data.forEach((location) => {
          $("#newDepartmentLocation").append(
            "<option value='" + location.id + "'>" + location.name + "</option>"
          );

          $("#editDepartmentLocation").append(
            "<option value='" + location.id + "'>" + location.name + "</option>"
          );
        });
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
}

// referesh table contents
function referesh() {
  getAllPersonnel();
  getAllDepartments();
  getAllLocations();
  populateDeptDropdown();
  populateLocationsDropdown();
}

// clear alert message
function clearAlertMessage() {
  $("#alertOK").click(() => {
    $("#alertMessage").html("");
  });
}

// stop action
$(".stopAction").click(function () {
  // personnel actions
  $("#newPersonnelForm")[0].reset();
  $("#deletePersonnelID").empty();
  $("p").remove("#deletePersonnelPrompt");

  // department actions
  $("#newDepartmentForm")[0].reset();
  $("#deleteDepartmentID").empty();
  $("p").remove("#deleteDepartmentPrompt");

  // location actions
  $("#newLocationForm")[0].reset();
  $("#deleteLocationID").empty();
  $("p").remove("#deleteLocationPrompt");
});

// show loading spinner
function showSpinner() {
  $("#pre-load").removeClass("fadeOut");
}

// hide loading spinner
function hideSpinner() {
  $("#pre-load").addClass("fadeOut");
}
