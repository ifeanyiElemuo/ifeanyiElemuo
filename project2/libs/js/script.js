$(window).on("load", () => {
  getAllPersonnel();
  getAllDepartments();
  getAllLocations();
  getDepartmentCountByID(1);
});

$(document).ready(function () {
  // clear search input
  $("#personnelBtn").click(() => {
    $("#searchInp").val("");
    getAllPersonnel();
  });

  $("#departmentsBtn").click(() => {
    $("#searchInp").val("");
    getAllDepartments();
  });

  $("#locationsBtn").click(() => {
    $("#searchInp").val("");
    getAllLocations();
  });

  // to search personnel, departments, and locations
  $("#searchInp").on("keyup", function () {
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
    getAllPersonnel();
    getAllDepartments();
    getAllLocations();
  });
});

// clear alert message
$("#alertOK").click(() => {
    $("#alertMessage").html("");
})

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
    success: ({ status, data }) => {
      if (status.name === "ok") {
        $("#alertMessage").html("<p>New department added!</p>");
        $("#newDepartmentForm")[0].reset();
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
});

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
              "</td><td class='text-end text-nowrap'><button type='button' class='btn btn-primary btn-sm editPersonnelBtn' data-bs-toggle='modal' data-bs-target='#editPersonnelModal' data-id='" +
              person.id +
              "' dept-id='" +
              person.departmentID +
              "'><i class='fa-solid fa-pencil fa-fw'></i></button><button type='button' class='btn btn-primary btn-sm deletePersonnelBtn'data-bs-toggle='modal' data-bs-target='#deletePersonnelModal' data-id='" +
              person.id +
              "'><i class='fa-solid fa-trash fa-fw'></i></button></td></tr>"
          );
        });

        $(".editPersonnelBtn").click(function () {
          // fills form with selected personnel data
          getPersonnelByID($(this).attr("data-id"));
          // select personnel department option from dropdown
          $("#editPersonnelDepartment").val($(this).attr("dept-id"));
        });
      }
      hideSpinner();
    },
    error: function (err) {
      console.log(err);
    },
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
              "<td class='align-middle text-end text-nowrap'><button type='button' class='btn btn-primary btn-sm editDepartmentBtn' data-bs-toggle='modal' data-bs-target='#editDepartmentModal' data-id='" +
              department.id +
              "' location-id='" +
              department.locationID +
              "'><i class='fa-solid fa-pencil fa-fw'></i></button><button type='button' class='btn btn-primary btn-sm deleteDepartmentBtn' data-bs-toggle='modal' data-bs-target='#deleteDepartmentModal' data-id='" +
              department.id +
              "'><i class='fa-solid fa-trash fa-fw'></i></button></td></tr>"
          );

          // add personnel department dropdown
          $("#newPersonnelDepartment").append(
            "<option value='" +
              department.id +
              "'>" +
              department.name +
              "</option>"
          );

          // edit personnel department dropdown
          $("#editPersonnelDepartment").append(
            "<option value='" +
              department.id +
              "'>" +
              department.name +
              "</option>"
          );
        });
        $(".editDepartmentBtn").click(function () {
          // fills form with selected department name
          getDepartmentByID($(this).attr("data-id"));
          //selects department location from dropdown
          $("#editDepartmentLocation").val($(this).attr("location-id"));
        });
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
}

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
              "</td><td class='align-middle text-end text-nowrap'><button type='button' class='btn btn-primary btn-sm editLocationBtn' data-bs-toggle='modal' data-bs-target='#editLocationModal' data-id='" +
              location.id +
              "'><i class='fa-solid fa-pencil fa-fw'></i></button><button type='button' class='btn btn-primary btn-sm deleteLocationBtn' data-bs-toggle='modal' data-bs-target='#deleteLocationModal' data-id='" +
              location.id +
              "'><i class='fa-solid fa-trash fa-fw'></i></button></td></tr>"
          );
          // add new department dropdown
          $("#newDepartmentLocation").append(
            "<option value='" + location.id + "'>" + location.name + "</option>"
          );

          // edit department location dropdown
          $("#editDepartmentLocation").append(
            "<option value='" + location.id + "'>" + location.name + "</option>"
          );
        });
        $(".editLocationBtn").click(function () {
          // fills form with selected location name
          getLocationByID($(this).attr("data-id"));
        });
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
}

// get personnel by ID
function getPersonnelByID(id) {
  $.ajax({
    url: "./libs/php/getPersonnelByID.php",
    type: "GET",
    dataType: "json",
    data: { id },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        var person = data.personnel[0];
        $("#editPersonnelFirstName").val(person.firstName);
        $("#editPersonnelLastName").val(person.lastName);
        $("#editPersonnelEmailAddress").val(person.email);
        $("#editPersonnelJobTitle").val(person.jobTitle);
      }
    },
  });
}

// get department by ID
function getDepartmentByID(id) {
  $.ajax({
    url: "./libs/php/getDepartmentByID.php",
    type: "GET",
    dataType: "json",
    data: { id },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        var department = data[0];
        $("#editDepartmentName").val(department.name);
      }
    },
  });
}

// get location by ID
function getLocationByID(id) {
  $.ajax({
    url: "./libs/php/getLocationByID.php",
    type: "GET",
    dataType: "json",
    data: { id },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        //   console.log(data);
        var location = data[0];
        $("#editLocationName").val(location.name);
      }
    },
  });
}

// get department count by ID
function getDepartmentCountByID(id) {
  $.ajax({
    url: "./libs/php/getDepartmentCountByID.php",
    type: "GET",
    dataType: "json",
    data: { id },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        //   console.log(data);
        var departmentCount = data[0].departmentCount;
        return departmentCount;
      }
    },
  });
}

// show loading spinner
function showSpinner() {
  $("#pre-load").removeClass("fadeOut");
}

// hide loading spinner
function hideSpinner() {
  $("#pre-load").addClass("fadeOut");
}
