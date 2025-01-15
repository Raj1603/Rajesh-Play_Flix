// *************** Initialize Firebase ****************************
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore,  doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {  getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { loggedInUserId } from "./movies.js";

// Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyB3VZw2WEmDvMXyFEbpc00umhEykmmY8N8",
  authDomain: "login-form-f5168.firebaseapp.com",
  projectId: "login-form-f5168",
  storageBucket: "login-form-f5168.appspot.com",
  messagingSenderId: "374763286727",
  appId: "1:374763286727:web:b9773388aadfbd40cd8ee2"
};

// Initialize Firebase App and Services
export const app = initializeApp(firebaseConfig);
 export const db = getFirestore(app);

 export const auth = getAuth();

// *************** Fetch Logged-in User Data ****************************
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userId = user.uid; // Get the user's UID
    console.log("Logged-in User ID:", userId);

    try {
      const docRef = doc(db, "users", userId); // Reference to the user's document
      const docSnap = await getDoc(docRef);   // Fetch the document
      const userDetails = document.getElementById("users");  // Render the userDetails in 'USERS' -HTML -  container 

      if (docSnap.exists()) {
        const userData = docSnap.data();  
        console.log("User Data:", userData.Username);
        userDetails.innerHTML = `
          <h3 class="userName fw-bold">${userData.Username}</h3>`;

      } else {
        console.warn("No such document found for the user!");
        userDetails.innerHTML = `
          <h3 class="fw-bold"> Guest user</h3>`;
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  } else {
    console.log("No user is signed in.");
  }

  // Toggle Login and Logout UI
  if (loggedInUserId) {
    const hideLogin = document.getElementById('login');
    if (hideLogin) hideLogin.style.display = "none";
  } else {
    const hideLogout = document.getElementById('logout');
    const hideIcon = document.getElementById('icon');

    if (hideLogout) hideLogout.style.display = "none";
    if (hideIcon) hideIcon.style.display = "none";
  }

  // Logout functionality
  document.getElementById('logout')?.addEventListener('click', () => {
    signOut(auth)
      .then(() => {
        confirm('Are you sure you want to log out')
        // alert('User logged out successfully!');
        window.location.href = './index.html';  // Stay at the same page(INDEX.HTML)
        localStorage.clear(); // clear the localstorage especially for that --loggedInUserId--
        console.log("Local storage has been cleared.");  // Final confirmation log result through console..--Admin --  versatility--
      })
      .catch((error) => {
        console.error('Error logging out:', error.message);
      });
  });
});

