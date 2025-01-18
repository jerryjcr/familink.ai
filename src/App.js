// src/App.js
import React, { useState } from 'react';
import Register from './/Register.js';
import Login from './/Login.js';
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './/firebase.js';

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <div>
      {!user ? (
        <>
          <Register />
          <Login onLogin={setUser} />
        </>
      ) : (
        <>
          <h2>Welcome, {user.email}</h2>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
};

export default App;
