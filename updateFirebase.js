import { db } from ".//firebase.js"

async function updateFirestore(inputText) {
  try {
    const docRef = await addDoc(collection(db, 'answers'), {
      content: inputText,
      timeSent: new Date().toISOString(),
    });
    alert('Answer successfully sent!');
  } catch (e) {
    alert('Failed to send answer!');
  }
}

// Attach event listener to an input field and button
document.addEventListener('DOMContentLoaded', () => {
  const inputField = document.getElementById('textInput'); // The text input element
  const submitButton = document.getElementById('submitButton'); // The button element

  // Listen for button click
  submitButton.addEventListener('click', () => {
    const inputText = inputField.value.trim(); // Get the text input value
    if (inputText) {
      updateFirestore(inputText); // Call the Firestore update function
      inputField.value = ''; // Clear the input field
    } else {
      alert('Please enter some text!');
    }
  });
});
