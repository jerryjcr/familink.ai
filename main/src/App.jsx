import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, orderBy, query, doc, setDoc, getDoc } from 'firebase/firestore';

function App() {

  // Generate a random user ID for this instance
  const [user, setUser] = useState(Math.floor(Math.random() * 10000));
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [relationship, setRelationship] = useState(localStorage.getItem('relationship') || '');
  const [isRelationshipHovered, setIsRelationshipHovered] = useState(false);
  const [isRelationshipEditMode, setIsRelationshipEditMode] = useState(false);


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

  const handleMouseEnter = () => {
    setIsRelationshipHovered(true);
  };

  const handleMouseLeave = () => {
    setIsRelationshipHovered(false);
  };

  const handleRelationshipChange = (event) => {
    setRelationship(event.target.value);
    localStorage.setItem('relationship', event.target.value);
  };

  const handleRelationshipClick = () => {
    setIsRelationshipEditMode(true);
  };

  const generateQuestion = async (messages) => {
    const apiURL = 'https://api.openai.com/v1/chat/completions';

  console.log(messages);
    const currentUser = user;
    const otherUser = messages.length > 0 ? messages[0].sender === currentUser ? 2 : 1 : null;
    const currentUserRelationship = localStorage.getItem('relationship');
    const otherUserRelationship = messages.find(msg => msg.sender === otherUser)?.relationship;

    const prompt = `Given the following chat history, with the relationship context of being '${currentUserRelationship}' and '${otherUserRelationship || 'unknown'}', ask a question that will help them get to know each other on a deeper level. Avoid repeat questions: ${JSON.stringify(messages)}`;


    try {
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '
        },
        body: JSON.stringify({

          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 150,

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
          date: new Date().getDate()
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
        const today = new Date().getDate();
        console.log(data.date, today);

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

          sender: user,
          timestamp: new Date(),
          relationship: relationship


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
        <div className="question-box-container">
          <div className="question-box">
            <div id="question-title">today's question:</div>
            <div id="question-placeholder">{question}</div>
          </div>
          <div
            className="relationship-input"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {!isRelationshipEditMode ? (
              <div onClick={handleRelationshipClick}>
                {isRelationshipHovered ? 'Change?' : relationship}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Relationship"
                value={relationship}
                onChange={handleRelationshipChange}
                onBlur={() => setIsRelationshipEditMode(false)}
              />
            )}
          </div>
        </div>

        <div className="chat">
          {messages.map(msg => (
            <div key={msg.id} className={`user ${msg.sender === user ? 'one' : 'two'}`}>
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
