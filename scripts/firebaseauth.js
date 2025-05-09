// Firebase setup remains unchanged...

// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3VZw2WEmDvMXyFEbpc00umhEykmmY8N8",
    authDomain: "login-form-f5168.firebaseapp.com",
    projectId: "login-form-f5168",
    storageBucket: "login-form-f5168.appspot.com",
    messagingSenderId: "374763286727",
    appId: "1:374763286727:web:b9773388aadfbd40cd8ee2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Function to show messages using SweetAlert
// function showMessage(message, divId) {
//     Swal.fire({
//         title:  (divId === "signUpMessage" || divId === "signInMessage") ? "Sign Up" : "Sign In",
//         text: message,
//         icon: (divId === "signUpMessage" || divId === "signInMessage") ? "success" : "error",
//         timer: 2000,
//         showConfirmButton: true,
//         timerProgressBar: true
//     });
// }
function showMessage(message, divId, isError = false) {
    Swal.fire({
        title: isError ? "Error" : (divId === "signUpMessage" || divId === "signInMessage") ? "Success" : "Info",
        text: message,
        icon: isError ? "error" : "success",
        timer: 5000,
        showConfirmButton: true,
        timerProgressBar: true
    });
}



// Function to clear all error messages
function clearErrorMessages() {
    document.getElementById("fNameError").textContent = "";
    document.getElementById("lNameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("passwordError").textContent = "";
    document.getElementById("signInEmailError").textContent = "";
    document.getElementById("signInPasswordError").textContent = "";
}
// clearErrorMessages();

// Helper function to validate email and password format for sign-up form
function validateSignUp(email, password, firstName, lastName) {
    const namePattern = /^[A-Za-z]+$/;
    const emailPattern = /^[a-z0-9._%+-]+@[a-z][a-z0-9.-]*\.[a-z]{2,}$/;
    const passwordPattern = /^(?=(.*[a-z]))(?=(.*[A-Z]))(?=(.*\d))(?=(.*[@$!%*?&#]))[A-Za-z\d@$!%*?&#]/;
    const minPasswordLength = 8;
    let isValid = true;

    if (!emailPattern.test(email)) {
        document.getElementById("emailError").textContent = "Give valid email address.";
        document.getElementById("emailError").classList.add("error");
        isValid = false;

    }

    if (password.length < minPasswordLength) {
        document.getElementById("passwordError").textContent = `Password must contain ${minPasswordLength} characters.`;
        document.getElementById("passwordError").classList.add("error");
        isValid = false;
        
    } else if (!passwordPattern.test(password)) {
        document.getElementById("passwordError").textContent = "Password must contain a special character and an uppercase.";
        document.getElementById("passwordError").classList.add("errorforPassWord");
        isValid = false;
    }

    if (!namePattern.test(firstName)) {
        document.getElementById("fNameError").textContent = "Only alphabets are allowed.";
        document.getElementById("fNameError").classList.add("error");
        isValid = false;
    } else if (firstName.length < 3) {
        document.getElementById("fNameError").textContent = "Firstname cannot be lesser than 3 words.";
        document.getElementById("fNameError").classList.add("error");
        isValid = false;
    }

    if (firstName.trim() === "") {
        document.getElementById("fNameError").textContent = "First name cannot be empty.";
        document.getElementById("fNameError").classList.add("error");
        isValid = false;
    }

    if (!namePattern.test(lastName)) {
        document.getElementById("lNameError").textContent = "Only alphabets are allowed.";
        document.getElementById("lNameError").classList.add("error");
        isValid = false;
    }

    if (lastName.trim() === "") {
        document.getElementById("lNameError").textContent = "Last name cannot be empty.";
        document.getElementById("lNameError").classList.add("error");
        isValid = false;
    }
 

    return isValid;
}

// Helper function to validate input for sign-in form
function validateSignIn(email, password) {
    clearErrorMessages();

    let isValid = true;
    const emailPattern = /^[^\s@]+@[a-zA-Z][^\s@]*\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        document.getElementById("signInEmailError").textContent = "Invalid Email.";
        document.getElementById("signInEmailError").classList.add("error");
        isValid = false;
    }

    if (email.trim() === "") {
        document.getElementById("signInEmailError").textContent = "Email cannot be empty.";
        document.getElementById("signInEmailError").classList.add("error");
        isValid = false;
    }

    if (password.trim() === "") {
        document.getElementById("signInPasswordError").textContent = "Password cannot be empty.";
        document.getElementById("signInPasswordError").classList.add("error");
        isValid = false;
    }

    return isValid;
}

// Sign-Up Functionality
document.getElementById("submitSignUp").addEventListener("click", (event) => {
    event.preventDefault();

    const email = document.getElementById("rEmail").value;
    const password = document.getElementById("rPassword").value;
    const firstName = document.getElementById("fName").value;
    const lastName = document.getElementById("lName").value;
    const userName = `${firstName} ${lastName}`;

    if (!validateSignUp(email, password, firstName, lastName)) {
        document.getElementById("submitSignUp").reset();
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userData = { email: email, Username: userName };
            showMessage("Account Created Successfully", "signUpMessage");

            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData)
                .then(() => {
                    localStorage.setItem("loggedInUserId", user.uid);
                    window.location.href = "../index.html";
                })
                .catch((error) => {
                    console.error("Error writing document:", error);
                    showMessage("Error saving user data. Please try again.", true);
                   
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode === "auth/email-already-in-use") {
                document.getElementById("emailError").textContent = "Email Address Already Exists!";
                document.getElementById("emailError").classList.add("error");
            } else {
                showMessage("Unable to create user. Please try again.", true);
            }
        });
});

// Sign-In Functionality
document.getElementById("submitSignIn").addEventListener("click", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!validateSignIn(email, password)) {
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            showMessage("Login is successful", "signInMessage");
            const user = userCredential.user;
            localStorage.setItem("loggedInUserId", user.uid);
            window.location.href = "../index.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            // || errorCode === "auth/user-not-found       Email or "
            if (errorCode === "auth/wrong-password" ) {
                document.getElementById("signInMessage").textContent = "Incorrect Password.";
                showMessage("Incorrect Email or Password.", "signInMessage",true);
                
                console.log("Wrong password")
            } else {
                showMessage("Account does not exist", "signInMessage",true);
                console.log("Account does not exist")
            }
        });
});
