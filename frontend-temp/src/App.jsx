import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, orderBy, query, doc, setDoc, getDoc } from 'firebase/firestore';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [lastInput, setLastInput] = useState(null);
  const user = 'user1'; // Define the user variable


  useEffect(() => {
    const q = query(collection(db, "questions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLastInput(snapshot.docs[0].data());
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  const generateQuestion = async (messages) => {
    const apiURL = 'https://api.openai.com/v1/chat/completions';
    const prompt = `Given the following chat history between two family members, ask a question that will help them get to know each other on a deeper level: ${JSON.stringify(messages)}`;

    try {
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'system', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const generatedQuestion = data.choices[0].message.content.trim();
        setQuestion(generatedQuestion);
        await setDoc(doc(db, "dailyQuestion", "current"), {
          question: generatedQuestion,
          date: new Date().toLocaleDateString()
        });
      } else {
        console.error('No question generated from OpenAI API.');
      }
    } catch (error) {
      console.error('Error generating question:', error);
    }
  };

  useEffect(() => {
    const fetchDailyQuestion = async () => {
      const docRef = doc(db, "dailyQuestion", "current");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const today = new Date().toLocaleDateString();

        if (data.date === today) {
          setQuestion(data.question);
        } else {
          generateQuestion(messages);
        }
      } else {
        generateQuestion(messages);
      }
    };


      fetchDailyQuestion();
    
  }, [messages]);

  const sendMessage = async () => {
    if (message.trim() !== '') {
      try {
        await addDoc(collection(db, "messages"), {
          text: message,
          sender: 'user1',
          timestamp: new Date()
        });
        setMessage('');
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  };

  return (
    <div className="app">
      <div className="left-panel">
        <img src="tree-placeholder.png" alt="Tree Illustration" />
        <div className="name">
          familink.ai <span className="uofthacks">uofthacks 12.</span>
        </div>
      </div>

      <div className="right-panel">
        <div className="question-box">
          <div id="question-title">today's question:</div>
          <div id="question-placeholder">{question}</div>
        </div>

        <div className="chat">
          {messages.map(msg => (
            <div key={msg.id} className={`user ${msg.sender === user ? 'one' : 'two'}`}>
              {question}
              <p>{"\n"}</p>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="input-container">
          <input
            type="text"
            placeholder="type here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button id="input_button" onClick={sendMessage}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
