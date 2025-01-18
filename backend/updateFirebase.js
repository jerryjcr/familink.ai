import { db } from ".//firebase.js"
import { collection, addDoc } from "firebase/firestore"

let user = "1";

const getPreviousDocuments = async (collection, currentTime) => {
    const answersCollection = collection(db, collection);
    const q = query (
        answersCollection,
        orderBy("timeSent", "desc"),
        where("timeSent", "<", currentTime),
        limit(2)
    );
    const previousAnswer = await getDocs(q);
    return previousAnswer;
};

const getAnswersSize = async () => {
    const answersCollection = collection(db, "answers");
    const snapshot = await getDocs(answersCollection);
    return snapshot.size;
};

async function updateFirestore(inputText, user) {
    try {
        const docRef = await addDoc(collection(db, "answers"), {
            content: inputText,
            timeSent: new Date().toISOString(),
            userId: user,
        });
        if (genAnswersSize() % 2 == 0) {
            //send questions to both users
            const questions = getPreviousDocuments("questions", new Date());
        }
        alert('Answer successfully sent!');
    } catch (e) {
        alert('Failed to send answer!');
    }
}

// Attach event listener to an input field and button, maybe not right IDs
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
