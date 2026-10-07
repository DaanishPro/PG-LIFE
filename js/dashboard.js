window.addEventListener("load", function () {
    var is_interested_images = document.getElementsByClassName("is-interested-image");
    Array.from(is_interested_images).forEach(element => {
        element.addEventListener("click", function (event) {
            var XHR = new XMLHttpRequest();
            var property_id = event.target.getAttribute("property_id");

            // On success
            XHR.addEventListener("load", remove_interested_success);

            // On error
            XHR.addEventListener("error", on_error);

            // Set up request
            XHR.open("GET", "api/toggle_interested.php?property_id=" + property_id);

            // Initiate the request
            XHR.send();

            document.getElementById("loading").style.display = 'block';
            event.preventDefault();
        });
    });

    var edit_profile_form = document.getElementById("edit-profile-form");
    if (edit_profile_form) {
        edit_profile_form.addEventListener("submit", function (event) {
            var XHR = new XMLHttpRequest();
            var form_data = new FormData(edit_profile_form);

            // On success
            XHR.addEventListener("load", edit_profile_success);

            // On error
            XHR.addEventListener("error", on_error);

            // Set up request
            XHR.open("POST", "api/edit_profile_submit.php");

            // Form data is sent with request
            XHR.send(form_data);

            document.getElementById("loading").style.display = 'block';
            event.preventDefault();
        });
    }
});

var remove_interested_success = function (event) {
    document.getElementById("loading").style.display = 'none';

    var response = JSON.parse(event.target.responseText);
    if (response.success) {
        var property_id = response.property_id;

        document.getElementsByClassName("property-id-" + property_id)[0].style.display = 'none';
    }
};

var edit_profile_success = function (event) {
    document.getElementById("loading").style.display = 'none';

    try {
        var response = JSON.parse(event.target.responseText);
        if (response.success) {
            var user = response.user;

            var nameEl = document.querySelector(".my-profile .profile .name");
            var emailEl = document.querySelector(".my-profile .profile .email");
            var phoneEl = document.querySelector(".my-profile .profile .phone");
            var collegeEl = document.querySelector(".my-profile .profile .college");
            var navNameEl = document.querySelector(".header .nav-name");

            if (nameEl) nameEl.textContent = user.full_name;
            if (emailEl) emailEl.textContent = user.email;
            if (phoneEl) phoneEl.textContent = user.phone;
            if (collegeEl) collegeEl.textContent = user.college_name;
            if (navNameEl) navNameEl.textContent = "Hi, " + user.full_name;

            var passwordField = document.getElementById("edit-password");
            if (passwordField) passwordField.value = "";

            window.$("#edit-profile-modal").modal("hide");
            alert(response.message);
        } else {
            alert(response.message);
        }
    } catch (e) {
        alert("Something went wrong! Please try again.");
    }
};

var on_error = function (event) {
    document.getElementById("loading").style.display = 'none';
    alert('Oops! Something went wrong.');
};
