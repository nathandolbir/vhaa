import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import upload from "./pictures/upload.png";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

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

//const userRef = firestore.collection(auth.currentUser.uid);
//let metadataRef = userRef.doc("User_metadata");

class User {
  getUser() {
    console.log(auth.currentUser);
    return auth.currentUser;
  }
  getUID() {
    return auth.currentUser.uid;
  }
  getUsername() {
    return auth.currentUser.displayName;
  }
  getNickname() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // user is signed in
        metadataRef.get().then((doc) => {
          if (doc.exists) {
            console.log("what is twhaeiotgf;nasedokgas");
            return doc.get("name");
          } else {
            return "why";
          }
        });
        console.log("why am I here right now");
        return null;
      }
    }
    
  }
  hasDischargeSummary() {
    metadataRef.get().then((doc) => {
      if (doc.exists) {
        console.log(doc.data());
        if (doc.get("hasDischargeSummary") === true) return true;
      }
    });
    return false;
  }

  hasName() {
    console.log("here");
    metadataRef.get().then((doc) => {
      console.log(doc.data());
      var tempName = doc.get("name");
      console.log(tempName);
      if (tempName === null || tempName === "") return false;
    });
    return true;
  }
}

const user = new User();

function App() {
  const [user] = useAuthState(auth);
  function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  delay(1000).then(() => console.log("ran after 1 second1 passed"));

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
    user.getUser() && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom(props) {
  const dummy = useRef();

  const [name, setName] = useState("");
  const [viewAddName, setViewAddName] = useState("#333333");
  const [hasDischargeSummary, setHasDischargeSummary] = useState(false);

  const messagesRef = userRef.doc("Messages").collection("Msg");

  const query = messagesRef.orderBy("createdAt");
  const [messages, load] = useCollectionData(query);
  let msgLength = 0;
  if (load === false) {
    msgLength = messages.length;
  }
  //const length = messages.length;
  // console.log(length);

  const [formValue, setFormValue] = useState("");
  // console.log(getNumMessages(messages));

  const sendMessage = async (e) => {
    e.preventDefault();
    const botResponse = "I am thinking...";
    const { uid, photoURL } = user.getUser();
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
        {user.hasName() ? (
          <div class="user">Welcome back, {user.getNickname()}!</div>
        ) : (
          <AddUser
            viewAddName={viewAddName}
            username={user.getUsername()}
            metadataRef={metadataRef}
            dummy={dummy}
          ></AddUser>
        )}
        {user.hasDischargeSummary() ? (
          <h1>You uploaded a discharge summary yay!</h1>
        ) : (
          <DSupload
            metadataRef={metadataRef}
            hasDischargeSummary={hasDischargeSummary}
            viewAddName={viewAddName}
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

function AddUser(props) {
  const [formValue, setFormValue] = useState("");
  const username = props.username;
  const metadataRef = props.metadataRef;
  const dummy = props.dummy;
  const viewAddName = props.viewAddName;
  const setName = async (e) => {
    e.preventDefault();
    await metadataRef.set({
      name: formValue,
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };
  // ßif (viewAddName == false) return 0;

  return (
    <form className="adduser" onSubmit={setName}>
      <p>Hello {username}! What would you like Machbot to call you?</p>
      <input
        value={formValue}
        onChange={(e) => setFormValue(e.target.value)}
        placeholder="Enter a name"
      />

      <button type="submit" disabled={!formValue}>
        Set
      </button>
    </form>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === user.getUID() ? "sent" : "received";

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
  var poop = 0;

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setFilePicked(true);
    metadataRef.update({ hasDischargeSummary: true });
  };

  const handleSubmission = () => {};

  if (poop == 1) return <h1>I hate this</h1>;
  else {
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
}

export default App;
