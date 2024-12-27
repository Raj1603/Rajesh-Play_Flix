


// ****************** Initialize Firebase **************************
import { db } from "./admin.js";
import { auth } from "./admin.js";
import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ************************** Wishlist Functions **************************

// Function to fetch and display the user's wishlist
async function fetchWishlist(userId) {
  const userRef = doc(db, "users", userId);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const wishlist = userData.wishlist || []; // Default to empty array

      const wishlistMoviesList = document.getElementById("wishlist-movies");
      wishlistMoviesList.innerHTML = ""; // Clear previous list

      if (wishlist.length > 0) {
        wishlist.forEach((movieId) => {
          // Create list item
          const listItem = document.createElement("li");
          listItem.textContent = `Movie ID: ${movieId}`;

          // Remove Button
          const removeButton = document.createElement("button");
          removeButton.textContent = "Remove";
          removeButton.addEventListener("click", () =>
            removeMovieFromWishlist(userId, movieId)
          );

          // Append to list
          listItem.appendChild(removeButton);
          wishlistMoviesList.appendChild(listItem);
        });
      } else {
        wishlistMoviesList.innerHTML = "<p>No movies in your wishlist yet.</p>";
      }
    }
  } catch (error) {
    console.error("Error fetching wishlist:", error);
  }
}

// Function to remove a movie from the wishlist
async function removeMovieFromWishlist(userId, movieId) {
  const userRef = doc(db, "users", userId);

  try {
    await updateDoc(userRef, {
      wishlist: arrayRemove(movieId),
    });

    console.log(`Movie ${movieId} removed from wishlist.`);
    fetchWishlist(userId); // Refresh wishlist after removal
  } catch (error) {
    console.error("Error removing movie:", error);
    alert("Failed to remove movie. Please try again.");
  }
}

// ************************** Event Listeners **************************
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userId = user.uid;
    console.log("Logged-in User ID:", userId);

    // Fetch and display user data
    const DisplayName = document.getElementById("user-name");
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      DisplayName.innerText = `Name: ${userData.Username || "No name"}`;
      document.getElementById("user-email").innerText = `Email: ${user.email}`;
    } else {
      console.warn("User document not found.");
    }

    // Fetch and display wishlist
    fetchWishlist(userId);

    

   // Add movie to wishlist
document.querySelectorAll(".watch-later-btn").forEach((button) => {
  button.addEventListener("click", async (event) => {
    // Get the movie ID using getAttribute
    const movieId = event.target.getAttribute("data-movie-id");

    console.log(`Movie ID from getAttribute: ${movieId}`);

    try {
      // Update the wishlist in Firestore
      await updateDoc(doc(db, "users", userId), {
        wishlist: arrayUnion(movieId),
      });

      console.log(`Movie ${movieId} added to wishlist.`);
      
      // Optionally refresh the wishlist
      fetchWishlist(userId); 
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  });
});

  } else {
    alert("User not logged in. Redirecting...");
  }
});
