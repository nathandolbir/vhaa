import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import upload from "./pictures/upload.png";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";

// credential information for accessing firebase app, not a security concern
firebase.initializeApp({
  apiKey: "AIzaSyARA0qKiir3MBYbAY1UNEBc31B79Hkdp7Q",
  authDomain: "virtual-health-assistant-aiisc.firebaseapp.com",
  projectId: "virtual-health-assistant-aiisc",
  storageBucket: "virtual-health-assistant-aiisc.appspot.com",
  messagingSenderId: "709149362435",
  appId: "1:709149362435:web:64026c875266f3e0aec136",
  measurementId: "G-RW8KSTCDSK",
});

const auth = firebase.auth(); // used for user authorization into app
const firestore = firebase.firestore(); // used to access firestore doc-DB
var userRef = null;
var metadataRef = null;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // user is signed in
    userRef = firestore.collection(auth.currentUser.uid);
    metadataRef = userRef.doc("User_metadata");
  } else {
    // user is not signed in
  }
});

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛MediBot💬</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
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

function ChatRoom(props) {
  const dummy = useRef();
  const username = auth.currentUser.displayName;
  const messagesRef = userRef.doc("Messages").collection("Msg");
  const query = messagesRef.orderBy("createdAt");
  const [messages, load] = useCollectionData(query);
  //const [metadataDoc, load] = useDocumentData(metadataRef);
  //const []
  let msgLength = 0;
  if (load === false) {
    msgLength = messages.length;
  }

  const [showAddNickname, setShowAddNickname] = useState(true);
  const [showAddDS, setShowAddDS] = useState(true);

  React.useEffect(() => {
    checkShowAddNickname();
    checkShowAddDS();
  }, [showAddNickname, showAddDS]);

  function checkShowAddNickname() {
    metadataRef.get().then((doc) => {
      if (doc.exists) {
        let name = doc.get("name");
        if (name === null || name === "" || name === undefined) {
          setShowAddNickname(true);
        } else {
          setShowAddNickname(false);
        }
      }
    });
  }

  function checkShowAddDS() {
    metadataRef.get().then((doc) => {
      if (doc.exists) {
        if (
          doc.get("hasDischargeSummary") !== true &&
          showAddNickname === false
        ) {
          setShowAddDS(true);
        } else {
          setShowAddDS(false);
        }
      }
    });
  }

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const botResponse = "I am thinking...";
    const { uid, photoURL } = auth.currentUser;
    const docName = `message${msgLength}`;
    await messagesRef.doc(docName).set({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      botResponse: botResponse,
      metadata: false,
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => (
            <React.Fragment>
              <ChatMessage message={msg} />
              <BotMessage message={msg} />
            </React.Fragment>
          ))}
        {showAddNickname && (
          <AddNickname
            username={username}
            metadataRef={metadataRef}
            dummy={dummy}
            checkShowAddNickname={checkShowAddNickname}
            checkShowAddDS={checkShowAddDS}
          ></AddNickname>
        )}
        {showAddDS && (
          <DSupload
            metadataRef={metadataRef}
            checkShowAddDS={checkShowAddDS}
          ></DSupload>
        )}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something to MediBot"
        />
        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}

function AddNickname(props) {
  const [formValue, setFormValue] = useState("");
  const username = props.username;
  const metadataRef = props.metadataRef;
  var poo;
  var pee;
  const dummy = props.dummy;
  let nam = "poo";

  const setName = async (e) => {
    e.preventDefault();
    await metadataRef.update({
      name: formValue,
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };
  let clickHandler = () => {
    props.checkShowAddNickname();
    props.checkShowAddDS();
  };

  // ßif (viewAddName == false) return 0;
  return (
    <div>
      {
        <form className="adduser" onSubmit={setName}>
          <p>Hello {username}! What would you like Machbot to call you?</p>
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Enter a name"
          />

          <button type="submit" disabled={!formValue} onClick={clickHandler}>
            Set
          </button>
        </form>
      }
    </div>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
        />
        <p>{text}</p>
      </div>
    </>
  );
}

function BotMessage(props) {
  const { botResponse } = props.message;
  if (botResponse === "I am thinking...") {
    return (
      <>
        <div className={`message received`}>
          <img
            src={
              "	https://blogs.3ds.com/northamerica/wp-content/uploads/sites/4/2019/08/Robots-Square-610x610.jpg"
            }
          />
          <div class="dot-pulse"></div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className={`message received`}>
          <img
            src={
              "	https://blogs.3ds.com/northamerica/wp-content/uploads/sites/4/2019/08/Robots-Square-610x610.jpg"
            }
          />
          <p>{botResponse}</p>
        </div>
      </>
    );
  }
}
function DSupload(props) {
  const uid = auth.currentUser.uid;
  const metadataRef = props.metadataRef;

  const [selectedFile, setSelectedFile] = useState();
  const [filePicked, setFilePicked] = useState(false);

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setFilePicked(true);
    metadataRef.update({ hasDischargeSummary: true });
  };

  let clickHandler = () => {
    props.checkShowAddDS();
  };

  return (
    <div>
      {
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
            onClick={clickHandler}
          >
            <img className="upload" src={upload}></img>
          </label>
        </div>
      }
    </div>
  );
}

export default App;
