/**
 * Register Functionality
 */
const Register = (function () {
  if (document.querySelector("#register-form")) {
    const registerForm = document.querySelector("#register-form");

    registerForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      let form_errors = []; //empty errors array
      document.querySelector("#register-form-info").innerHTML = "";

      let firstname = this.firstname.value.trim();
      let lastname = this.lastname.value.trim();
      let email = this.email.value.trim();
      let password = this.password.value.trim();

      let password_confirm = this.password_confirm.value.trim();

      if (firstname.length == 0) {
        form_errors.push("You did not enter first name");
        document.querySelector(
          "#register-form-info"
        ).innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not enter first name
                </div>`;
      }

      if (lastname.length == 0) {
        form_errors.push("You did not enter last name");
        document.querySelector(
          "#register-form-info"
        ).innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not enter last name
                </div>`;
      }

      if (email.length == 0) {
        form_errors.push("You did not enter email");
        document.querySelector(
          "#register-form-info"
        ).innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not enter email
                </div>`;
      }

      if (password.length == 0) {
        form_errors.push("You did not enter password");
        document.querySelector(
          "#register-form-info"
        ).innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not enter password
                </div>`;
      }

      if (password_confirm.length == 0) {
        form_errors.push("You did not confirm password");
        document.querySelector(
          "#register-form-info"
        ).innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not confirm password
                </div>`;
      }

      if (password != password_confirm) {
        //output error
        form_errors.push("Password must match Password Confirmation");
        document.querySelector(
          "#register-form-info"
        ).innerHTML += `<div class='mb-3 alert alert-danger'>
                                                                            Password must match Password Confirmation
                                                                        </div>`;
      }

      if (form_errors.length == 0) {
        //start the spinner
        Spinners.startSpinner();

        //there are no errors
        const userdata = {
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: password,
        };

        const feedback = await axios.post("/register-user", userdata);
        console.log(feedback);

        if (feedback) {
          //stop the spinner
          Spinners.stopSpinner();

          document.querySelector(
            "#register-form-info"
          ).innerHTML = `<div class='alert alert-success'>
                        <h4>Your account was created successfully!</h4>
                        <p>We sent you a validation email. Please click the link to activate your account.</p>
                    </div>`;

          //clear the form field
          // $("#register-form")[0].reset();
          $("#register-form").html("<div></div>");
        }
      }
    });
  }
})();

/**
 * Login Functionality
 */
const Login = (function () {
  if (document.querySelector("#login-form")) {
    const loginForm = document.querySelector("#login-form");

    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      Spinners.startSpinner();

      let email = this.email.value.trim();
      let password = this.password.value.trim();

      //check to confirm the email/password
      const feedback = await axios.post("/check-user-details", {
        email: email,
        password: password,
      });

      if (feedback) {
        Spinners.stopSpinner();
        console.log("Hey: ", feedback.data.code);
        if (feedback.data.code == "valid-user") {
          //login this user
          Spinners.startSpinner();
          const loginFeedback = await axios.post("/login-user", {
            email: email,
            password: password,
          });

          if (loginFeedback) {
            Spinners.stopSpinner();

            if (loginFeedback.data.code == "authenticated") {
              location.href = "/user";
            }
          }
        }
      }
    });
  }
})();

const PostHandler = (function () {
  if (document.querySelector("#create-post-form")) {
    const ckeditor = CKEDITOR.replace("post_content");
    const createPostForm = document.querySelector("#create-post-form");
    const createPostFormBtn = document.querySelector("#create-post-form-btn");
    createPostFormBtn.addEventListener("click", async function (event) {
      //event.preventDefault();
      let post_title = createPostForm.post_title.value.trim();
      let post_content = ckeditor.getData();

      if (post_title.length != 0 && post_content.length != 0) {
        //proceed
        const feedback = await axios.post("/create-new-post", {
          post_title: post_title,
          post_content: post_content,
        });

        if (feedback) {
          alert("Post has been sent to users");
        }
      }
    });
  }
})();

/**
 * Spinners Functionality
 */
const Spinners = (function () {
  function startSpinner() {
    const modalCode = `<div class="modal" tabindex="-1" id='spinner-modal' data-backdrop='static' data-keyboard='false'>
        <div class="modal-dialog modal-dialog-centered border-0">
          <div class="modal-content border-0" style='background: transparent;'>
            <!-- <div class="modal-header border-0">
              <h5 class="modal-title">Please wait ...</h5>
            </div> -->
            <div class="modal-body border-0">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            </div>
          </div>
        </div>
      </div>`;

    let divElement = document.createElement("div");
    divElement.innerHTML = modalCode;

    document.body.appendChild(divElement);

    $("#spinner-modal").modal("show");
  }

  function stopSpinner() {
    $("#spinner-modal").modal("hide");
  }

  return {
    startSpinner: startSpinner,
    stopSpinner: stopSpinner,
  };
})();

const PusherHandler = (function () {
  if (document.getElementById("users-display")) {
    $("head").append(`<link rel="stylesheet" href="/stylesheets/users.css">`);

    // Pusher.logToConsole = true;

    var pusher = new Pusher("8b5cd779f27159bed863", {
      cluster: "eu",
    });

    var channel = pusher.subscribe("simpleapp");
    channel.bind("new-post", function (data) {
    //   alert(JSON.stringify(data));
    //   console.log(data)
      $(".cont").append(`<div class = "sec">
      <div class = "profCont">
      <img class = "profile" src = "https://c1.staticflickr.com/5/4007/4626436851_5629a97f30_b.jpg">
       </div>
      <div class = "txt">${data.post_title}</div>
     <div class = "txt ">${data.post_content}</div>
   </div>`);


   let num = document.getElementById("number").innerHTML;
   console.log(parseInt(num) + 1) 
   let new_num = parseInt(num) + 1
   document.getElementById("number").innerHTML = new_num.toString()
   

    });

  
    

    
  }
})();
