$(document).ready(function () {
  var hasFirstName = false;
  var hasLastName = false;
  var hasEmail = false;
  var hasPassword = false;
  var passwordMatch = false;
  var validBirthday =false;
  $('#FirstName').focus(function () {
    $(this).on('keyup', function () {
      var value = $(this).val();
      if (value.length < 3 || value.length > 15) {
        $(this).removeClass("my-valid-border");
        $(this).addClass("my-invalid-border");
        hasFirstName = false
      } else {
        $(this).removeClass("my-invalid-border");
        $(this).addClass("my-valid-border");
        hasFirstName = true;
      }
    });
  });

  $('#LastName').focus(function () {
    $(this).on('keyup', function () {
      var value = $(this).val();
      if (value.length < 3 || value.length > 15) {
        $(this).removeClass("my-valid-border");
        $(this).addClass("my-invalid-border");
        hasLastName = false;
      } else {
        $(this).removeClass("my-invalid-border");
        $(this).addClass("my-valid-border");
        hasLastName = true;
      }
    });
  });

  $('#Email1').focus(function () {
    $(this).on('keyup', function () {
      var value = $(this).val();
      // Regular expression to validate simple email
      // /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
      var filter = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))){2,6}$/i;
      if (filter.test(value)) {
        $(this).removeClass("my-invalid-border");
        $(this).addClass("my-valid-border");
        hasEmail = true;
      } else {
        $(this).removeClass("my-valid-border");
        $(this).addClass("my-invalid-border");
        hasEmail = false;
      }
    });
  });

  $('#Password1').focus(function () {
    $(this).on('keyup', function () {
      var value = $(this).val();
      if (value.length < 5 || value.length > 15) {
        $(this).removeClass("my-valid-border");
        $(this).addClass("my-invalid-border");
        hasPassword = false;
      } else {
        $(this).removeClass("my-invalid-border");
        $(this).addClass("my-valid-border");
        hasPassword = true;
      }
    });
  });

  $('#Password2').focus(function () {
    $(this).on('keyup', function () {
      var value = $(this).val();
      var value2 = $('#Password1').val();
      if (value != value2) {
        $(this).removeClass("my-valid-border");
        $(this).addClass("my-invalid-border");
        passwordMatch = false;
      } else {
        $(this).removeClass("my-invalid-border");
        $(this).addClass("my-valid-border");
        passwordMatch = true;
      }
    });
  });

  $('#Birthday').focus(function () {
    $(this).on('keyup', function () {
      var value = $(this).val();
      var filter = /^(0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-]\d{4}$/;
      if (filter.test(value)) {
        console.log("a");
        $(this).removeClass("my-invalid-border");
        $(this).addClass("my-valid-border");
        validBirthday =true;
      } else {
        console.log("b");
        $(this).removeClass("my-valid-border");
        $(this).addClass("my-invalid-border");
        validBirthday =false;
      }
    });
  });

  $('#user-sign-up-form').submit(function (event) {
    if(!validBirthday || !passwordMatch || !hasPassword || !hasEmail || !hasLastName || !hasFirstName){
      $('.invalid-info-alert').removeClass('invalid-info-alert');
      event.preventDefault();
    }
  })
});
