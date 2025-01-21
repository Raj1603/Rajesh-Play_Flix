import { auth } from "./admin.js";
import { db } from "./admin.js";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";



import { loggedInUserId } from "./movies.js";

import { fetchMovies } from "./movies.js";

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
    wishlistMoviesList.innerHTML = ""; // Clear previous list before rendering

    // Fetch all movies from "movies" collection
    const moviesSnap = await getDocs(collection(db, "movies"));
// const moviesSet = new Set(); // Use a Set to avoid duplicates
const moviesMap = new Map(); // Use a Map to store unique movies

moviesSnap.forEach((doc) => {
  const movie = doc.data();
  if (wishlist.includes(movie.name) && !moviesMap.has(movie.name)) {
    // movies.add(JSON.stringify(movie));  // Add unique movie object as string to the Set
    moviesMap.set(movie.name, movie); // Add unique movie to the map
  }
});

    // const movies = Array.from(moviesSet).map((movie) => JSON.parse(movie)); // Parse back to objects
    const movies = Array.from(moviesMap.values()); // Get unique movie objects

    // Render movies in the wishlist
    if (movies.length > 0) {
      movies.forEach((movie) => {
        const movieCard = document.createElement("div");
        movieCard.className = "wishlist-Card";

       movieCard.innerHTML="" // clear existing elements
        movieCard.innerHTML =  `
        <img src="${movie.image}" alt="${movie.name}" >
        <h3><strong>Title:</strong> ${movie.name || "N/A"}</h3>
        <p><strong>Genre:</strong> ${movie.genre || "N/A"}</p>
        <div class= "child-hover-text-wishlist">
        ${
            loggedInUserId
              ? `<a href="./movie-details.html?name=${encodeURIComponent(movie.name )}" class="btn" >Watch Now</a>`
              : `<a href="./movie-details.html?name=${encodeURIComponent(movie.name)}"  >Watch Trailer</a>`
          }
          
          <i class="fa-sharp fa-solid fa-heart remove-btn" data-movie-id="${movie.name}" ></i>
          <span class="child-tooltip-text-wishlist">Remove movie from wishlist</span>
       </div>   
       
    `;


        wishlistMoviesList.appendChild(movieCard);
      });
    } else {
      wishlistMoviesList.innerHTML = "<p>No matching movies found in your wishlist.</p>";
    }
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    // alert("Failed to load the wishlist. Please try again.");
  }
}


// Function to remove a movie from the wishlist______________________________________________________________------------
const removeMovieFromWishlist = async (userId, movieName) => {
  const userRef = doc(db, "users", userId);

  try {
    await updateDoc(userRef, {
      wishlist: arrayRemove(movieName),
    });

    console.log(`Movie "${movieName}" removed from wishlist.`);

              //  // After removing, call fetchMovies to refresh the movie data
              window.location.reload();  //page reload..
              
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const content = document.getElementById('content');

  // Hide the loader after a delay (optional)
  setTimeout(() => {
    loader.style.display = 'none'; // Hide the loader
    content.style.display = 'block'; // Show the main content
  }, 2000); // Adjust delay as needed
});
    
        // After adding, fetch fresh data and re-render the UI
        //await fetchMovies();  // Fetch fresh movie data and re-render UI
       // fetchWishlist(userId);  // Refresh the wishlist UI with the updated data
  } catch (error) {
    console.error("Error removing movie:", error);
    alert("Failed to remove movie. Please try again.");
  }
};




// Use event delegation for dynamically generated "remove-btn" elements
document.body.addEventListener("click", async (event) => {
  if (event.target.classList.contains("remove-btn")) {
    const movieName = event.target.getAttribute("data-movie-id");
    const userId = localStorage.getItem("loggedInUserId");

    if (!userId) {
      alert("Please log in to remove movies from your wishlist.");
      return;
    }

       

    removeMovieFromWishlist(userId, movieName); // Call the function to remove the movie
       // Fetch and update the UI after removal
       // await fetchMovies();  // Fetch fresh movie data and re-render UI
       //fetchWishlist(userId);  // Refresh the wishlist UI with the updated data
  }
});

// ************************** Event Listeners **************************

// Use event delegation for dynamically generated "Watch Later" buttons
document.body.addEventListener("click", async (event) => {

  if (event.target.classList.contains("watch-later-btn")) {
    event.target.style.color ="pink";
    const movieName = event.target.getAttribute("data-movie-id");
    const userId = localStorage.getItem("loggedInUserId");

    if (!userId) {
      alert("Please log in to add movies to your wishlist.");
      window.location.href="../pages/login.html";
      return;
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const subscriptionPlan = userData.subscriptionPlan || "free";

      // Check subscription plan
      if (subscriptionPlan === "free") {
        alert(" Subcribed user only allow add movies  in wishlist.");
        window.location.href = '../pages/user-detailAndMovies.html';
        return;
      }

      // Check if the movie already exists in the wishlist
      if (userData.wishlist && userData.wishlist.includes(movieName)) {
       
        alert(`This  ${movieName} movie is already in your wishlist. `);
        return;
      }

      // Add movie to wishlist
      try {
        await updateDoc(userRef, {
          wishlist: arrayUnion(movieName),
        });
        console.log(`Movie ${movieName} added to wishlist.`);
      
        window.location.reload();  
    

        // After adding, fetch fresh data and re-render the UI
        // await fetchMovies();  // Fetch fresh movie data and re-render UI
        fetchWishlist(userId);  // Refresh the wishlist UI with the updated data
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

      // fetchWishlist(userId); // Fetch wishlist for eligible users
      // Show subscription info
      if (subscriptionPlan == "free") {

      // Check if the user is eligible for the "Premium" plan
      document.getElementById('wishlist-section').style.display = 'none';
      document.getElementById("details").style.display = 'block';
        document.querySelector('.pricing-section').style.display = 'block';
      } else {
        document.getElementById("details").style.display = 'block';
        document.getElementById('wishlist-section').style.display = 'block';
        document.querySelector('.pricing-section').style.display = 'none';
        // document.querySelector('.pricing-section').style.display = 'block';
        // document.getElementById('subscription-upgrade').style.display = 'block';
        
        fetchWishlist(userId); // Fetch wishlist for eligible users
      }
// here place to start feature request to update the subscription
    } else {
      console.warn("User document not found.");
    }
  } else {
    console.log("User not logged in. Redirecting...");
  }
});
// ---------------------------------------------------------------- 
// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Attach event listeners to all subscription buttons
  document.querySelectorAll('.Subscription-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      // Find the closest card and extract details
      const card = e.target.closest('.card');
      const planName = card.querySelector('h2').textContent;
      const price = card.querySelector('.price').textContent;

      // Update the subscription details in the upgrade div
      document.getElementById("userPlan").textContent = `Price: ${price} / Duration: ${planName}`;



      // Dim the body and show the subscription-upgrade div
      const detailsDisplay=document.getElementById("details");
      detailsDisplay.style.display="none";
      detailsDisplay.classList.add(".details-display");
      const upgradeDiv = document.getElementById('subscription-upgrade');
      upgradeDiv.style.display="block";

  
    });
  });

  // Add event listener for the close button
  document.getElementById("closeSubscription").addEventListener('click', () => {
    // Remove the dimmed class from the body
    const detailsDisplay=document.getElementById("details");
    detailsDisplay.style.display="block";


    // Hide the subscription-upgrade div
    const upgradeDiv = document.getElementById('subscription-upgrade');
    upgradeDiv.style.display="none";


    document.getElementById("paymentForm").reset(); // Ensure the form ID matches
  });
});


// ************************** Subscription Plan Upgrade (via Dropdown) **************************
document.getElementById("paymentSubmit").addEventListener("click", async (e) => {
  e.preventDefault();
  const cardNumber = document.getElementById("cardNumber").value.trim();
  const expirationDate = document.getElementById("expirationDate").value.trim();
  const cvv = document.getElementById("cvv").value.trim();
  const nameOnCard = document.getElementById("nameOnCard").value.trim();
  // const agree = document.getElementById("agree").checked;
  const userId = localStorage.getItem("loggedInUserId");
  const subscriptionPlan = document.getElementById("userPlan").textContent;
  console.log(subscriptionPlan);
  

  // Clear previous errors
  document.getElementById("cardNumberError").style.display = "none";
  document.getElementById("expirationDateError").style.display = "none";
  document.getElementById("cvvError").style.display = "none";
  document.getElementById("nameOnCardError").style.display = "none";

  if (!ValidatePaymentForm(cardNumber, expirationDate, cvv, nameOnCard)) {
    return;
  }

  // if (!agree) {
  //   alert("You must agree to the terms and conditions.");
  //   return;
  // }

  if (!userId) {
    alert("Please log in to change your subscription plan.");
    window.location.href = '../pages/user-detailAndMovies.html';
    
    return;
  }

  if (!subscriptionPlan) {
    alert("Please select a subscription plan.");
    return;
  }

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.warn("User document not found.");
    return;
  }

  const userData = userSnap.data();
  // if (userData.cardNumber === cardNumber) {
  //   alert("This card number is already in use.");
  //   return;
  // }

  try {
    await updateDoc(userRef, {
      cardNumber: cardNumber,
      expirationDate: expirationDate,
      cvv: cvv,
      nameOnCard: nameOnCard,
      subscriptionPlan: subscriptionPlan.toString()
    });

    alert(`Now you get full access by this Plan ${subscriptionPlan} `);
    document.getElementById("paymentForm").reset(); //  Ensure the form ID matches
    fetchWishlist(userId); // Fetch wishlist for eligible users 
    location.reload(); // Page reload 

  } catch (error) {
    console.error("Error upgrading plan:", error.message);
    alert("Failed to upgrade plan. Please try again.");
  }
});

function ValidatePaymentForm(cardNumber, expirationDate, cvv, nameOnCard) {
  const cardNumberPattern = /^(\d{16}|\d{4}-\d{4}-\d{4}-\d{4})$/;
  const expirationPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
  const cvvPattern = /^\d{3,4}$/;
  const nameOnCardPattern = /^[A-Za-z\s]+$/;

  let valid = true;

  // Clear previous errors
  document.getElementById("cardNumberError").style.display = "none";
  document.getElementById("expirationDateError").style.display = "none";
  document.getElementById("cvvError").style.display = "none";
  document.getElementById("nameOnCardError").style.display = "none";

  if (!cardNumber || !cardNumberPattern.test(cardNumber)) {
    document.getElementById("cardNumberError").textContent = cardNumber
      ? "Invalid card number."
      : "Card Number is required.";
    document.getElementById("cardNumberError").style.display = "block";
    valid = false;
  }

  if (!expirationDate || !expirationPattern.test(expirationDate)) {
    document.getElementById("expirationDateError").textContent = expirationDate
    
      ? "Please enter a valid expiry date in MM/YY format" 
      : "Expiration Date is required.";
    document.getElementById("expirationDateError").style.display = "block";
    valid = false;
  }
  else{
    // check expiration date in the future
    const [month,year]=expirationDate.split("/").map(Number);  // split and asign the month and year as number using the map function.
    const userCardExpDate =new Date(2000+year,month-1);   // Implement in Date format .
    const currentDate=new Date();
    if(userCardExpDate <=currentDate){
      alert(`The expiry date must be a future date.`);
     valid =false; //
  }

 }

  if (!cvv || !cvvPattern.test(cvv)) {
    document.getElementById("cvvError").textContent = cvv
      ? "Invalid CVV."
      : "CVV is required.";
    document.getElementById("cvvError").style.display = "block";
    valid = false;
  }

  if (!nameOnCard || !nameOnCardPattern.test(nameOnCard)) {
    document.getElementById("nameOnCardError").textContent = nameOnCard
      ? "Invalid name on card."
      : "Name on Card is required.";
    document.getElementById("nameOnCardError").style.display = "block";
    valid = false;
  }
  else if(nameOnCard.length<3){
    document.getElementById("nameOnCardError").textContent = "Name on Card should be at least 3 characters long.";
    document.getElementById("nameOnCardError").style.display = "block";
  
  
    valid = false;
  }

  

  return valid;
}
