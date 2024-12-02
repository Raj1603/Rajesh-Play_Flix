// export function isValidFirtname( Firstname){
//     if((typeof Firstname) != 'string'){
//         console.error('value should be a string');
//         return false;
//     }
//     if(str.trim === ''){
//         console.log("value can't be empty")
//         return false;
//     }
//     if(pattern && !pattern.test(str)){
//         console.error(`${name} is matching the pattern`);
//         return false;
//     }
//     return true;
// }

// Validate username (only letters and numbers, 3-15 characters)
export function validateUsername(username) {
    const usernameRegex = /^[A-Za-z\d]{3,15}$/;
    return usernameRegex.test(username);
}



// Validate email format
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


// Validate password (minimum 8 characters, at least 1 letter and 1 number)
export function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
}