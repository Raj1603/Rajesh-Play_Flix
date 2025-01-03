import { auth } from "./admin.js";
import { db } from "./admin.js";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  getDocs,
  collection,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { loggedInUserId } from "./movies.js";

// ************************** Wishlist Functions **************************

// Function to fetch and display the user's wishlist
async function fetchWishlist(userId) {
  const userRef = doc(db, "users", userId);

  try {
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn("User document not found.");
      alert("User not found. Please contact support.");
      return;
    }

    const userData = userSnap.data();
    const wishlist = userData.wishlist || []; // Default to empty array

    const wishlistMoviesList = document.getElementById("wishlist-movies");
    wishlistMoviesList.innerHTML = ""; // Clear previous list

    // Fetch all movies from "movies" collection
    const moviesSnap = await getDocs(collection(db, "movies"));
    const movies = [];
    moviesSnap.forEach((doc) => {
      const movie = doc.data();
      // If the movie name is in the wishlist, add it to the list
      if (wishlist.includes(movie.name)) {
        movies.push(movie);
      }
    });

    // Render movies in the wishlist
    if (movies.length > 0) {
      movies.forEach((movie) => {
        const movieCard = document.createElement("div");
        movieCard.innerHTML = `
          <img src="${movie.image}" alt="${movie.name}" >
          <p><strong>Genre:</strong> ${movie.genre || "N/A"}</p>
          ${
            loggedInUserId
              ? `<a href="./movie-details.html?name=${encodeURIComponent(movie.name)}" class="btn">Watch Now</a>`
              : `<a href="./movie-details.html?name=${encodeURIComponent(movie.name)}">Watch Trailer</a>`
          }
          <button class="remove-btn">Remove</button>
        `;

        // Add remove functionality
        movieCard.querySelector(".remove-btn").addEventListener("click", () =>
          removeMovieFromWishlist(userId, movie.name)
        );

        wishlistMoviesList.appendChild(movieCard);
      });
    } else {
      wishlistMoviesList.innerHTML = "<p>No matching movies found in your wishlist.</p>";
    }
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    alert("Failed to load the wishlist. Please try again.");
  }
}

// Function to remove a movie from the wishlist
async function removeMovieFromWishlist(userId, movieName) {
  const userRef = doc(db, "users", userId);

  try {
    await updateDoc(userRef, {
      wishlist: arrayRemove(movieName),
    });

    console.log(`Movie "${movieName}" removed from wishlist.`);
    fetchWishlist(userId); // Refresh wishlist after removal
  } catch (error) {
    console.error("Error removing movie:", error);
    alert("Failed to remove movie. Please try again.");
  }
}

// ************************** Event Listeners **************************

// Use event delegation for dynamically generated "Watch Later" buttons
document.body.addEventListener("click", async (event) => {
  if (event.target.classList.contains("watch-later-btn")) {
    const movieName = event.target.getAttribute("data-movie-id");
    const userId = localStorage.getItem("loggedInUserId");

    if (!userId) {
      alert("Please log in to add movies to your wishlist.");
      return;
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const subscriptionPlan = userData.subscriptionPlan || "free";

      // Check subscription plan
      if (subscriptionPlan === "free") {
        alert("Upgrade to a premium plan to add movies to your wishlist.");
        return;
      }

      // Check if the movie already exists in the wishlist
      if (userData.wishlist && userData.wishlist.includes(movieName)) {
        alert("This movie is already in your wishlist.");
        return;
      }

      // Add movie to wishlist using arrayUnion to avoid duplicates
      try {
        await updateDoc(userRef, {
          wishlist: arrayUnion(movieName),
        });
        console.log(`Movie ${movieName} added to wishlist.`);
        alert("Movie added to your wishlist!");
        fetchWishlist(userId); // Refresh wishlist
      } catch (error) {
        console.error("Error adding movie to wishlist:", error);
      }
    }
  }
});

// Handle auth state change
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userId = user.uid;
    console.log("Logged-in User ID:", userId);
    const userPlanElement = document.getElementById('user-plan');
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const subscriptionPlan = userData.subscriptionPlan || "free";

      document.getElementById("user-name").innerText = `Name: ${userData.Username || "No name"}`;
      document.getElementById("user-email").innerText = `Email: ${user.email}`;
      userPlanElement.innerText = `Plan: ${subscriptionPlan}`;

      // Show subscription info
      if (subscriptionPlan === "free") {
        document.getElementById('wishlist-movies').style.display = 'none';
        document.getElementById('subscription-upgrade').style.display = 'block';
      } else {
        document.getElementById('wishlist-movies').style.display = 'flex';
        document.getElementById('subscription-upgrade').style.display = 'none';
        fetchWishlist(userId); // Fetch wishlist for eligible users
      }
    } else {
      console.warn("User document not found.");
    }
  } else {
    alert("User not logged in. Redirecting...");
  }
});

// ************************** Subscription Plan Upgrade (via Dropdown) **************************

// Listen for changes to the dropdown to change subscription
document.getElementById("plan-dropdown").addEventListener("change", async (event) => {
  const newPlan = event.target.value;
  const userId = localStorage.getItem("loggedInUserId");

  if (!userId) {
    alert("Please log in to change your subscription plan.");
    return;
  }

  if (!["basic", "standard", "premium"].includes(newPlan)) {
    alert("Please select a valid plan.");
    return;
  }

  const userRef = doc(db, "users", userId);

  try {
    const duration = {
      basic: 7, // 7 days
      standard: 30, // 30 days
      premium: 90, // 90 days
    };

    const subscriptionExpiresAt = new Date();
    subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + duration[newPlan]);

    await updateDoc(userRef, {
      subscriptionPlan: newPlan,
      subscriptionExpiresAt: subscriptionExpiresAt.toISOString(),
    });

    alert(`Your plan has been upgraded to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}!`);
    document.getElementById("user-plan").innerText = `Plan: ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}`;
  } catch (error) {
    console.error("Error upgrading plan:", error);
    alert("Failed to upgrade plan. Please try again.");
  }
});

// ************************** Helper Function to Check Subscription Expiration **************************
const isSubscriptionActive = (expirationDate) => {
  const now = new Date();
  return new Date(expirationDate) > now;
};

// Load the wishlist when the page is fully loaded
window.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("loggedInUserId");

  if (userId) {
    // Fetch wishlist for eligible users
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const subscriptionPlan = userData.subscriptionPlan || "free";

      if (subscriptionPlan !== "free") {
        fetchWishlist(userId);
      }
    }
  }
});
