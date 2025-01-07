// import { auth } from "./admin.js";
//   import { db } from "./admin.js";
//   import {
//     doc,
//     updateDoc,
//     arrayUnion,
//     arrayRemove,
//     getDoc,
//     getDocs,
//     collection,
//   } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

    
  
//   // ************************** Wishlist Functions **************************
  
//   // Function to fetch and display the user's wishlist
//   async function fetchWishlist(userId) {
//     const userRef = doc(db, "users", userId);
  
//     try {
//       const userSnap = await getDoc(userRef);
  
//       if (userSnap.exists()) {
//         console.warn("User document not found.");
//         alert("User not found. Please contact support.");
//         return;
//       }
//         const userData = userSnap.data();
//         const wishlist = userData.wishlist || []; // Default to empty array
  
//         const wishlistMoviesList = document.getElementById("wishlist-movies");
//         wishlistMoviesList.innerHTML = ""; // Clear previous list
  
//      // Fetch all movies from "movies" collection
//      const moviesSnap = await getDocs(collection(db, "movies"));
//      const movies = [];
//      moviesSnap.forEach((doc) => {
//        const movie = doc.data();
//        if (wishlist.includes(movie.name)) {
//          movies.push(movie);
//        }
//      });
 
//      // Render movies in the wishlist
//      if (movies.length > 0) {
//        movies.forEach((movie) => {
//          const movieCard = document.createElement("div");
//          movieCard.className = "movie-card";
 
//          movieCard.innerHTML = `
//            <img src="${movie.image}" alt="${movie.name}" class="wishlist-movie-image">
//            <div class="wishlist-movie-details">
//              <h3>${movie.name}</h3>
//              <p><strong>Genre:</strong> ${movie.genre || "Unknown"}</p>
//              <p><strong>Description:</strong> ${
//                movie.description || "No description available."
//              }</p>
//              ${
//                auth.currentUser
//                  ? `<a href="./pages/movie-details.html?name=${encodeURIComponent(
//                      movie.name
//                    )}" class="btn">Watch Now</a>`
//                  : `<a href="./pages/movie-details.html?name=${encodeURIComponent(
//                      movie.name
//                    )}" class="btn">Watch Trailer</a>`
//              }
//              <button class="remove-btn">Remove</button>
//            </div>
//          `;
 
//          // Add remove functionality
//          movieCard
//            .querySelector(".remove-btn")
//            .addEventListener("click", () =>
//              removeMovieFromWishlist(userId, movie.name)
//            );
 
//          wishlistMoviesList.appendChild(movieCard);
//        });
//      } else {
//        wishlistMoviesList.innerHTML = "<p>No matching movies found in your wishlist.</p>";
//      }
//    } catch (error) {
//      console.error("Error fetching wishlist:", error);
//      alert("Failed to load the wishlist. Please try again.");
//    }
//  }
  
//   // Function to remove a movie from the wishlist
//   async function removeMovieFromWishlist(userId, movieName) {
//     const userRef = doc(db, "users", userId);
  
//     try {
//       await updateDoc(userRef, {
//         wishlist: arrayRemove(movieName),
//       });
  
//       console.log(`Movie "${movieName}" removed from wishlist.`);
//       fetchWishlist(userId); // Refresh wishlist after removal
//     } catch (error) {
//       console.error("Error removing movie:", error);
//       alert("Failed to remove movie. Please try again.");
//     }
//   }
  
//   // ************************** Event Listeners **************************
  
//   // Use event delegation for dynamically generated "Watch Later" buttons
//   document.body.addEventListener("click", async (event) => {
//     if (event.target.classList.contains("watch-later-btn")) {
//       const movieName = event.target.getAttribute("data-movie-id");
//       const userId = localStorage.getItem("loggedInUserId");
  
//       if (!userId) {
//         alert("Please log in to add movies to your wishlist.");
//         return;
//       }
  
//       const userRef = doc(db, "users", userId);
//       const userSnap = await getDoc(userRef);
  
//       if (userSnap.exists()) {
//         const userData = userSnap.data();
//         const subscriptionPlan = userData.subscriptionPlan || "free";
  
//         // Check subscription plan
//         if (subscriptionPlan === "free") {
//           alert("Upgrade to a premium plan to add movies to your wishlist.");
//           return;
//         }
  
//         // Check if the movie already exists in the wishlist
//         if (userData.wishlist && userData.wishlist.includes(movieName)) {
//           alert("This movie is already in your wishlist.");
//           return;
//         }
  
//         // Add movie to wishlist
//         try {
//           await updateDoc(userRef, {
//             wishlist: arrayUnion(movieName),
//           });
//           console.log(`Movie ${movieName} added to wishlist.`);
//           alert("Movie added to your wishlist!");
//           fetchWishlist(userId); // Refresh wishlist
//         } catch (error) {
//           console.error("Error adding movie to wishlist:", error);
//         }
//       }
//     }
//   });
  
//   auth.onAuthStateChanged(async (user) => {
//     if (user) {
//       const userId = user.uid;
//       console.log("Logged-in User ID:", userId);
  
//       const userRef = doc(db, "users", userId);
//       const userSnap = await getDoc(userRef);
  
//       if (userSnap.exists()) {
//         const userData = userSnap.data();
//         const subscriptionPlan = userData.subscriptionPlan || "free";
  
//         document.getElementById("user-name").innerText = `Name: ${userData.Username || "No name"}`;
//         document.getElementById("user-email").innerText = `Email: ${user.email}`;
//         document.getElementById("user-plan").innerText = `Plan: ${subscriptionPlan}`;
  
//         // Block access for "free" plan if needed
//         if (subscriptionPlan === "free") {
//           alert("Upgrade to a premium plan to use the wishlist feature!");
//         } else {
//           // Fetch wishlist for eligible users
//           fetchWishlist(userId);
//         }
//       } else {
//         console.warn("User document not found.");
//       }
//     } else {
//       alert("User not logged in. Redirecting...");
//     }
//   });
  
//   // ************************** Subscription Plan Upgrade **************************
//   document.getElementById("upgrade-form").addEventListener("submit", async (event) => {
//     event.preventDefault(); // Prevent form submission from reloading the page
  
//     const plan = document.getElementById("plan").value;
//     const cardNumber = document.getElementById("card-number").value;
//     const expiryDate = document.getElementById("expiry-date").value;
//     const cvv = document.getElementById("cvv").value;
  
//     // Validate inputs
//     if (!plan) {
//       alert("Please select a subscription plan.");
//       return;
//     }
  
//     if (!/^\d{16}$/.test(cardNumber)) {
//       alert("Invalid card number. Please enter a 16-digit card number.");
//       return;
//     }
  
//     const now = new Date();
//     const inputExpiry = new Date(expiryDate);
//     if (inputExpiry < now) {
//       alert("Card expiry date must be in the future.");
//       return;
//     }
  
//     if (!/^\d{3}$/.test(cvv)) {
//       alert("Invalid CVV. Please enter a 3-digit CVV.");
//       return;
//     }
  
//     // If validation passes, proceed with plan upgrade
//     const userId = localStorage.getItem("loggedInUserId");
  
//     if (!userId) {
//       alert("Please log in to upgrade your plan.");
//       return;
//     }
  
//     const userRef = doc(db, "users", userId);
  
//     try {
//       const duration = {
//         basic: 7, // 7 days
//         standard: 30, // 30 days
//         premium: 90, // 90 days
//       };
  
//       const subscriptionExpiresAt = new Date();
//       subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + duration[plan]);
  
//       await updateDoc(userRef, {
//         subscriptionPlan: plan,
//         subscriptionExpiresAt: subscriptionExpiresAt.toISOString(),
//       });
  
//       alert(`Your plan has been upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`);
//       document.getElementById("user-plan").innerText = `Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
//     } catch (error) {
//       console.error("Error upgrading plan:", error);
//       alert("Failed to upgrade plan. Please try again.");
//     }
//   });
  
//   // ************************** Helper Function to Check Subscription Expiration **************************
//   const isSubscriptionActive = (expirationDate) => {
//     const now = new Date();
//     return new Date(expirationDate) > now;
//   };




// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Form validation and submission
document.getElementById("paymentForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const cardNumber = document.getElementById("cardNumber").value.trim();
  const expirationDate = document.getElementById("expirationDate").value.trim();
  const cvv = document.getElementById("cvv").value.trim();
  const nameOnCard = document.getElementById("nameOnCard").value.trim();
  const agree = document.getElementById("agree").checked;

  let isValid = true;

  // Validate card number
  if (!/^\d{16}$/.test(cardNumber)) {
    document.getElementById("cardNumberError").style.display = "block";
    isValid = false;
  } else {
    document.getElementById("cardNumberError").style.display = "none";
  }

  // Validate expiration date
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expirationDate)) {
    document.getElementById("expirationDateError").style.display = "block";
    isValid = false;
  } else {
    document.getElementById("expirationDateError").style.display = "none";
  }

  // Validate CVV
  if (!/^\d{3,4}$/.test(cvv)) {
    document.getElementById("cvvError").style.display = "block";
    isValid = false;
  } else {
    document.getElementById("cvvError").style.display = "none";
  }

  // Validate name
  if (nameOnCard === "") {
    document.getElementById("nameOnCardError").style.display = "block";
    isValid = false;
  } else {
    document.getElementById("nameOnCardError").style.display = "none";
  }

  // Validate agreement
  if (!agree) {
    alert("You must agree to the terms and conditions.");
    isValid = false;
  }

  if (isValid) {
    // Save to Firebase
    db.collection("payments").add({
      cardNumber: cardNumber,
      expirationDate: expirationDate,
      cvv: cvv,
      nameOnCard: nameOnCard,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      alert("Payment information saved successfully!");
      document.getElementById("paymentForm").reset();
    })
    .catch((error) => {
      alert("Error saving payment information: " + error.message);
    });
  }
});
// ----------------------------------PREVIOUS CODE --------------------------------

// ************************** Subscription Plan Upgrade (via Dropdown) **************************

// Listen for changes to the dropdown to change subscription// Listen for form submission to upgrade the subscription plan
document.getElementById("upgrade-form").addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent form submission to handle via JavaScript

  const plan = document.getElementById("plan-dropdown").value;
  const cardNumber = document.getElementById("card-number").value;
  const expiryDate = document.getElementById("expiry-date").value;
  const cvv = document.getElementById("cvv").value;

  const userId = localStorage.getItem("loggedInUserId");

  // Validation for the plan selection
  if (!plan) {
    alert("Please select a plan.");
    return;
  }

  // Validation for card number (basic format check)
  const cardNumberPattern =/^\d{16}$/;
  if (!cardNumberPattern.test(cardNumber)) {
    alert("Please enter a valid card number (format: XXXX XXXX XXXX XXXX).");
    return;
  }

  // Validation for expiry date (must not be in the past)
  const currentDate = new Date();
  const expiry = new Date(expiryDate + "-01"); // Converts to Date object
  if (expiry < currentDate) {
    alert("Please select a valid expiry date (must not be in the past).");
    return;
  }

  // Validation for CVV (basic check)
  const cvvPattern = /^\d{3}$/;
  if (!cvvPattern.test(cvv)) {
    alert("Please enter a valid CVV (3 digits).");
    return;
  }

  // Check if the user is logged in
  if (!userId) {
    alert("Please log in to change your subscription plan.");
    return;
  }

  try {
    // Define the duration for each plan
    const duration = {
      basic: 7, // 7 days
      standard: 30, // 30 days
      premium: 90, // 90 days
    };

    // Calculate the expiration date based on the selected plan
    const subscriptionExpiresAt = new Date();
    subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + duration[plan]);

    // Get a reference to the user's Firestore document
    const userRef = doc(db, "users", userId);

    // Update the user's subscription plan in Firestore
    await updateDoc(userRef, {
      subscriptionPlan: plan,
      subscriptionExpiresAt: subscriptionExpiresAt.toISOString(),
    });

    // Notify the user of the successful upgrade
    alert(`Your plan has been upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`);

    // Update the UI to reflect the new plan
    document.getElementById("user-plan").innerText = `Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;

    // Hide the upgrade section and show the wishlist for upgraded users
    document.getElementById("subscription-upgrade").style.display = "none";
    document.querySelector(".pricing-section").style.display = "none";
    document.getElementById("wishlist-section").style.display = "flex";
  } catch (error) {
    console.error("Error upgrading plan:", error);
    alert("Failed to upgrade plan. Please try again.");
  }
});
