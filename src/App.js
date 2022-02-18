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
import { doc } from "firebase/firestore";

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
const usersRef = firestore.collection("users");
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

function DSupload(props) {
  const uid = auth.currentUser.uid;
  let userDoc = usersRef.doc(uid);

  const [selectedFile, setSelectedFile] = useState();
  const [filePicked, setFilePicked] = useState(false);

  userDoc.get().then((doc) => {
    if (doc.exists) {
      if (doc.data().DischargeSummary == true) {
        return 0;
      }
    }
  });

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setFilePicked(true);
    userDoc.set({ DischargeSummary: true });
  };

  const handleSubmission = () => {};

  return (
    <div>
      <div className="dsupload">
        <input
          type="file"
          id="discharge-summary-file"
          title=" "
          onChange={changeHandler}
        />
        <p>Hello! Please upload your Discharge Summary to MediBot.</p>
        <label
          for="discharge-summary-file"
          className="upload-box"
          onClick={handleSubmission}
        >
          <img className="upload" src={upload}></img>
        </label>
      </div>
    </div>
  );
}

export default App;
