import "./App.css";
import upload from "./pictures/upload.png";

import React, { useEffect, useRef, useState } from "react";
/* FUCK THIS SHIT 
import { initializeApp } from "firebase/app";
// import "firebase/compat/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";
*/

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARA0qKiir3MBYbAY1UNEBc31B79Hkdp7Q",
  authDomain: "virtual-health-assistant-aiisc.firebaseapp.com",
  projectId: "virtual-health-assistant-aiisc",
  storageBucket: "virtual-health-assistant-aiisc.appspot.com",
  messagingSenderId: "709149362435",
  appId: "1:709149362435:web:64026c875266f3e0aec136",
  measurementId: "G-RW8KSTCDSK",
};

// Initialize Firebase
//const firebaseApp = initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore(); // used to access firestore doc-DB

// const db = getFirestore(firebaseApp);
// Create a root reference
// const storage = getStorage();
function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        <h1>⚛MediBot💬</h1>
        <SignOut />
      </header>
      <section className="body">
        {user ? (
          <section className="main-page">
            <DSupload></DSupload>
          </section>
        ) : (
          <SignIn />
        )}
      </section>
    </div>
  );
}
// console.log(firebaseApp.auth.GoogleAuthProvider());
function SignIn() {
  const signInWithGoogle = () => {
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <div style={{ alignItems: "center" }}>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function DSupload() {
  return (
    <div className="dsupload">
      <p>Hello! Please upload your Discharge Summary to Medibot.</p>
      <div className="upload-box">
        <img className="upload" src={upload}></img>
      </div>
    </div>
  );
}

export default App;
