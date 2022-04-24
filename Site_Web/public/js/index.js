function onLoad() {
    const loginText = document.querySelector(".title-text .login");
    const loginForm = document.querySelector("form.login");
    const loginBtn = document.querySelector("label.login");
    const signupBtn = document.querySelector("label.signup");
    const signupLink = document.querySelector("form .signup-link a");
    const alertSucces = document.querySelector(".alert-succes");
    const alertError = document.querySelector(".alert-error");

    alertError.hidden = false;
    alertSucces.hidden = false;

    signupBtn.onclick = (() => {
        loginForm.style.marginLeft = "-50%";
        loginText.style.marginLeft = "-50%";
    });
    loginBtn.onclick = (() => {
        loginForm.style.marginLeft = "0%";
        loginText.style.marginLeft = "0%";
    });
    signupLink.onclick = (() => {
        signupBtn.click();
        return false;
    });

    let widgets = document.querySelectorAll(".data_widget");

    widgets.forEach(i => {
        i.addEventListener(this.click, function() {
            console.log(this.children.item)
        })
    })

    const validEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    const clearSignup = () => {
        document.querySelector("#signup-email").value = "";
        document.querySelector("#signup-password").value = "";
        document.querySelector("#signup-password-confirm").value = "";
    }

    const clearLogin = () => {
        document.querySelector("#login-email").value = "";
        document.querySelector("#login-password").value = "";
    }

    const showAlert = (param) => {
        let alert = document.querySelector(param);
        alert.classList.add("show");
        alert.classList.remove("hide");
        alert.classList.add("showAlert");
        setTimeout(function () {
            alert.classList.remove("show");
            alert.classList.add("hide");
        }, 2000);
    }

    document.querySelector("form.signup").addEventListener('submit', (e) => {
        e.preventDefault();

        let mail = document.querySelector("#signup-email").value
        let confirm_password = document.querySelector("#signup-password").value
        let password = document.querySelector("#signup-password-confirm").value

        if(validEmail(mail) && password.length &&confirm_password == password){

            let data = {
                'email': mail,
                'password': password,
                'confirm': confirm_password
            }

            axios.post('/api/register',JSON.stringify(data), {headers: {'Content-Type': 'application/json'}}
            )
                .then(function (response) {
                    if(response.data == 'succes'){
                        clearSignup()
                        document.querySelector(".slide.login").click();
                        showAlert(".alert-succes")
                        
                        
                    }
                    else {
                        clearSignup()
                        showAlert(".alert-error")
                    }
                })
                .catch(function (error) {
                    console.log(error);
                })
                .then(function () {
                    
                });
        }
    })

    document.querySelector("form.login").addEventListener('submit', (e) => {
        e.preventDefault();
        
        let mail = document.querySelector("#login-email").value
        let password = document.querySelector("#login-password").value

        if (validEmail(mail)) {

            let data = {
                'email': mail,
                'password': password,
            }

            axios.post('/api/login', JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }
            )
                .then(function (response) {
                    if(response.data == "error") {
                        clearLogin()
                        showAlert(".alert-error")
                    }
                    else if(response.data == "succes") {
                        window.location.replace("/home")
                    }
                })
                .catch(function (error) {
                    console.log(error);
                })
                .then(function () {

                });
        }
    })
}