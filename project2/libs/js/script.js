$(window).on("load", () => {
  getAllPersonnel();
  getAllDepartments();
  getAllLocations();
});

// get all personnel
function getAllPersonnel() {
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
              "</td><td class='text-end text-nowrap'><button type='button' class='btn btn-primary btn-sm edit-personnel-toggle-modal' data-bs-toggle='modal' data-bs-target='#editPersonnelModal' data-id='" +
              person.id +
              "'><i class='fa-solid fa-pencil fa-fw'></i></button><button type='button' class='btn btn-primary btn-sm deletePersonnelBtn' data-id='" +
              person.id +
              "'><i class='fa-solid fa-trash fa-fw'></i></button></td></tr>"
          );
        });

        $(".edit-personnel-toggle-modal").click(function () {
          getPersonnelByID($(this).attr("data-id"));
        });
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
}

// get all departments
function getAllDepartments() {
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
              "<td class='align-middle text-nowrap d-none d-md-table-cell'></td>" +
              "<td class='align-middle text-end text-nowrap'><button type='button' class='btn btn-primary btn-sm' data-bs-toggle='modal' data-bs-target='#editDepartmentModal' data-id='" +
              department.id +
              "'><i class='fa-solid fa-pencil fa-fw'></i></button><button type='button' class='btn btn-primary btn-sm deletePersonnelBtn' data-id='" +
              department.id +
              "'><i class='fa-solid fa-trash fa-fw'></i></button></td></tr>"
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
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
}

// get all locations
function getAllLocations() {
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
              "</td><td class='align-middle text-end text-nowrap'><button type='button' class='btn btn-primary btn-sm' data-bs-toggle='modal' data-bs-target='#editPersonnelModal' data-id='" +
              location.id +
              "'><i class='fa-solid fa-pencil fa-fw'></i></button><button type='button' class='btn btn-primary btn-sm deletePersonnelBtn' data-id='" +
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

// get location by ID
function getLocationByID(locationId) {
  $.ajax({
    url: "./libs/php/getLocationByID.php",
    type: "GET",
    dataType: "json",
    data: { locationId },
    success: ({ status, data }) => {
      if (status.name === "ok") {
        // console.log(data);
        return data;
      }
    },
  });
}
