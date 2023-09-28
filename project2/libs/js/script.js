$(window).on("load", () => {
  loadData();
});

$(document).ready(function () {
  // clear search input
  $("#personnelBtn").click(() => {
    $("#searchInputForm")[0].reset();
    getAllPersonnel();
  });

  $("#departmentsBtn").click(() => {
    $("#searchInputForm")[0].reset();
    $("#departmentBtn").addClass("active");
    getAllDepartments();
  });

  $("#locationsBtn").click(() => {
    $("#searchInputForm")[0].reset();
    $("#locationBtn").addClass("active");
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
    if ($("#personnelBtn").hasClass("active")) {
      getAllPersonnel();
    } else {
      if ($("#departmentsBtn").hasClass("active")) {
        getAllDepartments();
      } else {
        if ($("#locationsBtn").hasClass("active")) {
          getAllLocations();
        }
      }
    }
    $("#searchInputForm")[0].reset();
  });

  // add button
  $("#addBtn").click(() => {
    if ($("#personnelBtn").hasClass("active")) {
      $("#addPersonnelModal").modal("show");
    } else {
      if ($("#departmentsBtn").hasClass("active")) {
        $("#addDepartmentModal").modal("show");
      } else {
        if ($("#locationsBtn").hasClass("active")) {
          $("#addLocationModal").modal("show");
        }
      }
    }
  });
});

// ---- personnel CRUD functions ---
// to add new personnel
$("#addPersonnelModal").on("show.bs.modal", function () {
  $.ajax({
    url: "./libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        // clear dropdown data
        $("#newPersonnelDepartment").html("");
        //rebuild dropdown data
        data.forEach((department) => {
          $("#newPersonnelDepartment").append(
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
});

// add new personnel
$("#newPersonnelForm").submit(function (e) {
  e.preventDefault(); // prevents form submitting

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
        $("#addPersonnelModal").modal("hide");
        $("#newPersonnelForm")[0].reset();
        getAllPersonnel();
      } else {
        $("#alertModal").modal("show");
        $("#alertMessage").html("<p>Error adding new personnel!</p>");
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      throw err;
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
        var personnelRows = "";
        data.forEach((person) => {
          personnelRows +=
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
            "</td><td class='text-end text-nowrap'><button type='button' class='btn btn-info btn-sm' data-bs-toggle='modal' data-bs-target='#editPersonnelModal' data-id='" +
            person.id +
            "'><i class='fa-solid fa-pencil fa-fw'></i></button>&nbsp;<button type='button' class='btn btn-danger btn-sm' data-bs-toggle='modal' data-bs-target='#deletePersonnelModal' data-id='" +
            person.id +
            "'><i class='fa-solid fa-trash fa-fw'></i></button></td></tr>";
        });
        $("#personnelTable").append(personnelRows);
      }
      hideSpinner();
    },
    error: function (err) {
      console.log(err);
    },
  });
}

// to edit personnel data
$("#editPersonnelModal").on("show.bs.modal", function (e) {
  // fills form with selected personnel data
  var id = $(e.relatedTarget).attr("data-id");
  getPersonnelByID(id)
    .then((data) => {
      // console.log(data);
      var person = data.personnel[0];
      $("#editPersonnelID").val(person.id);
      $("#editPersonnelFirstName").val(person.firstName);
      $("#editPersonnelLastName").val(person.lastName);
      $("#editPersonnelEmailAddress").val(person.email);
      $("#editPersonnelJobTitle").val(person.jobTitle);

      // clear departments dropdown
      $("#editPersonnelDepartment").html("");
      var departments = data.department;
      //populate departments dropdown
      departments.forEach((department) => {
        $("#editPersonnelDepartment").append(
          $("<option>", {
            value: department.id,
            text: department.name,
          })
        );
      });

      // select personnel department option from dropdown
      $("#editPersonnelDepartment").val(person.departmentID);
    })
    .catch((error) => {
      console.log(error);
    });
});

// edit personnel by ID
$("#editPersonnelForm").submit(function (e) {
  e.preventDefault(); // prevents form submitting

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
        $("#editPersonnelModal").modal("hide");
      } else {
        $("#alertModal").modal("show");
        $("#alertMessage").html("<p>Error updating personnel data!</p>");
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      throw err;
    },
  });
});

// to delete personnel data
$("#deletePersonnelModal").on("show.bs.modal", function (e) {
  var id = $(e.relatedTarget).attr("data-id");
  getPersonnelByID(id)
    .then((data) => {
      // console.log(data);
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

// delete personnel by ID
$("#deletePersonnelForm").submit(function (e) {
  e.preventDefault(); // prevents form submitting

  var personnelID = $("#deletePersonnelID").val();
  $.ajax({
    url: "./libs/php/deletePersonnelByID.php",
    type: "POST",
    data: { personnelID },
    success: ({ status }) => {
      if (status.name === "ok") {
        // console.log(data);
        $("#deletePersonnelModal").modal("hide");
        getAllPersonnel();
      } else {
        $("#alertModal").modal("show");
        $("#alertMessage").html("<p>Personnel delete failed!</p>");
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      throw err;
    },
  });
  $("#deletePersonnelID").empty();
  $("p").remove("#deletePersonnelPrompt");
});

// ---- department CRUD functions ---
// to add new department
$("#addDepartmentModal").on("show.bs.modal", function () {
  $.ajax({
    url: "./libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        // clear dropdown data
        $("#newDepartmentLocation").html("");
        // rebuild dropdown data
        data.forEach((location) => {
          $("#newDepartmentLocation").append(
            "<option value='" + location.id + "'>" + location.name + "</option>"
          );
        });
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
});

// add new department
$("#newDepartmentForm").submit(function (e) {
  e.preventDefault(); // prevents form submitting

  // get form inputs
  var name = $("#newDepartmentName").val();
  var locationID = $("#newDepartmentLocation").val();

  $.ajax({
    url: "./libs/php/insertDepartment.php",
    type: "POST",
    data: { name, locationID },
    success: ({ status }) => {
      if (status.name === "ok") {
        $("#addDepartmentModal").modal("hide");
        $("#newDepartmentForm")[0].reset();
        getAllDepartments();
      } else {
        $("#alertModal").modal("show");
        $("#alertMessage").html("<p>Error adding new department!</p>");
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err);
      throw err;
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
              "<td class='align-middle text-end text-nowrap'><button type='button' class='btn btn-info btn-sm' data-bs-toggle='modal' data-bs-target='#editDepartmentModal' data-id='" +
              department.id +
              "'><i class='fa-solid fa-pencil fa-fw'></i></button>&nbsp;<button type='button' class='btn btn-danger btn-sm' data-bs-toggle='modal' data-bs-target='#deleteDepartmentModal' data-id='" +
              department.id +
              "'><i class='fa-solid fa-trash fa-fw'></i></button></td></tr>"
          );
        });
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
}

// to edit department data
$("#editDepartmentModal").on("show.bs.modal", function (e) {
  // fills form with selected department name
  var id = $(e.relatedTarget).attr("data-id");
  getDepartmentByID(id)
    .then((data) => {
      // console.log(data);
      var department = data.department[0];
      $("#editDepartmentID").val(department.id);
      $("#editDepartmentName").val(department.name);

      // clear location dropdown
      $("#editDepartmentLocation").html("");
      var locations = data.location;
      // populate locations dropdown
      locations.forEach((location) => {
        $("#editDepartmentLocation").append(
          $("<option>", {
            value: location.id,
            text: location.name,
          })
        );
      });

      //selects department location from dropdown
      $("#editDepartmentLocation").val(department.locationID);
    })
    .catch((error) => {
      console.log(error.responseText);
    });
});

// edit department by ID
$("#editDepartmentForm").submit(function (e) {
  e.preventDefault(); // prevents form submitting

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
        $("#editDepartmentModal").modal("hide");
        getAllDepartments();
      } else {
        $("#alert").modal("show");
        $("#alertMessage").html("<p>Error updating department data!</p>");
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      throw err;
    },
  });
});

// to delete department data
// get department employee count by ID
$("#deleteDepartmentModal").on("show.bs.modal", function (e) {
  var id = $(e.relatedTarget).attr("data-id");
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

// delete department by ID
$("#deleteDepartmentForm").submit(function (e) {
  e.preventDefault(); // prevents form submitting

  // get form input
  var departmentID = $("#deleteDepartmentID").val();

  $.ajax({
    url: "./libs/php/deleteDepartmentByID.php",
    type: "POST",
    data: { departmentID },
    success: ({ status }) => {
      if (status.name === "ok") {
        //   console.log(data);
        $("#deleteDepartmentModal").modal("hide");
        getAllDepartments();
      } else {
        $("#alert").modal("show");
        $("#alertMessage").html("<p> Error deleting department!</p>");
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      throw err;
    },
  });
  $("#deleteDepartmentID").empty();
  $("p").remove("#deleteDepartmentPrompt");
});

// ---- location CRUD functions ---
// add new location
$("#newLocationForm").submit(function (e) {
  e.preventDefault(); // prevents form submitting

  // get form inputs
  var name = $("#newLocationName").val();

  $.ajax({
    url: "./libs/php/insertLocation.php",
    type: "POST",
    data: { name },
    success: ({ status }) => {
      if (status.name === "ok") {
        $("#addLocationModal").modal("hide");
        $("#newLocationForm")[0].reset();
        getAllLocations();
      } else {
        $("#alert").modal("show");
        $("#alertMessage").html("<p>Error adding new location!</p>");
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      throw err;
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
              "</td><td class='align-middle text-end text-nowrap'><button type='button' class='btn btn-info btn-sm' data-bs-toggle='modal' data-bs-target='#editLocationModal' data-id='" +
              location.id +
              "'><i class='fa-solid fa-pencil fa-fw'></i></button>&nbsp;<button type='button' class='btn btn-danger btn-sm' data-bs-toggle='modal' data-bs-target='#deleteLocationModal' data-id='" +
              location.id +
              "'><i class='fa-solid fa-trash fa-fw'></i></button></td></tr>"
          );
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

//to edit location data
$("#editLocationModal").on("show.bs.modal", function (e) {
  // fills form with selected location name
  var id = $(e.relatedTarget).attr("data-id");
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

// edit location by ID
$("#editLocationForm").submit(function (e) {
  e.preventDefault(); // prevents form submitting

  // get form inputs
  var locationID = $("#editLocationID").val();
  var locationName = $("#editLocationName").val();

  $.ajax({
    url: "./libs/php/editLocationByID.php",
    type: "POST",
    data: { locationID, locationName },
    success: ({ status }) => {
      if (status.name === "ok") {
        $("#editLocationModal").modal("hide");
        getAllLocations();
      } else {
        $("#alert").modal("show");
        $("#alertMessage").html("<p>Error updating location data!</p>");
        clearAlertMessage();
      }
    },
    error: function (err) {
      console.log(err.responseText);
      throw err;
    },
  });
});

// to delete location
$("#deleteLocationModal").on("show.bs.modal", function (e) {
  var id = $(e.relatedTarget).attr("data-id");
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

// delete location by ID
$("#deleteLocationForm").submit(function (e) {
  e.preventDefault(); // prevents form submitting

  // get form input
  var locationID = $("#deleteLocationID").val();

  $.ajax({
    url: "./libs/php/deleteLocationByID.php",
    type: "POST",
    data: { locationID },
    success: ({ status }) => {
      if (status.name === "ok") {
        //   console.log(data);
        $("#deleteLocationModal").modal("hide");
        getAllLocations();
      } else {
        $("#alertModal").modal("show");
        $("#alertMessage").html("<p>Error deleting location!</p>");
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
// load table contents
function loadData() {
  getAllPersonnel();
  getAllDepartments();
  getAllLocations();
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