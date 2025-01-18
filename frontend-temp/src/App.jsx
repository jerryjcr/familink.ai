import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, orderBy, query } from 'firebase/firestore';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  const generateQuestion = async (messages) => {
    const apiURL = 'https://api.openai.com/v1/chat/completions';
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const prompt = `Given the following chat history between two family members, ask a question that will help them get to know each other on a deeper level: ${JSON.stringify(messages)}`;

    try {
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: "You are a helpful assistant that generates meaningful questions." }, { role: "user", content: prompt }],
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        setQuestion(data.choices[0].message.content.trim());
        localStorage.setItem('lastQuestionDate', new Date().toLocaleDateString());
      } else {
        console.error('No question generated from OpenAI API.');
      }
    } catch (error) {
      console.error('Error generating question:', error);
    }
  };

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

  useEffect(() => {
    const lastQuestionDate = localStorage.getItem('lastQuestionDate');
    const today = new Date().toLocaleDateString();

    if (messages.length > 0 && lastQuestionDate !== today) {
      generateQuestion(messages);
    } else if (!question && lastQuestionDate === today) {
      // If the question is already generated today, retrieve it
      const storedQuestion = localStorage.getItem('dailyQuestion');
      if (storedQuestion) {
        setQuestion(storedQuestion);
      }
    }
  }, [messages, question]);

  return (
    <div className="app">
      <div className="left-panel">
        <img src="/tree-placeholder.png" alt="Tree Illustration" />
        <div className="name">
          name here. <span className="uofthacks">uofthacks 12.</span>
        </div>
      </div>

      <div className="right-panel">
        <div className="question-box">
          <div id="question-title">today's question:</div>
          <div id="question-placeholder">{question}</div>
        </div>

        <div className="chat">
          {messages.map(msg => (
            <div key={msg.id} className={`user ${msg.sender === 'user1' ? 'one' : 'two'}`}>
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
