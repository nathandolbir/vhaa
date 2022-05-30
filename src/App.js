import React, { useRef, useState } from "react";
import "./App.css";
import upload from "./pictures/upload.png";
import notiBell from "./pictures/notiBellEdit.png";
import tinyTriangle from "./pictures/triangle.png";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";
// -->README<--
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
var storage = firebase.storage(); // used to access firebase storage
var storageRef = storage.ref(); // a reference to the storage to allow read write
var userRef = null; // a firestore reference to a user's collection of documents
var metadataRef = null; // a document for each user detailing some data about the user
var userStorageRef = null; // a storage reference for the user
var notificationsRef = null; // a collection of notifications for each user
var blenderbotRef = null; // buffer

firebase.auth().onAuthStateChanged((user) => {
  // when user logged in, set stuff
  if (user) {
    // user is signed in
    userRef = firestore.collection(auth.currentUser.uid);
    metadataRef = userRef.doc("User_metadata");
    userStorageRef = storageRef.child(auth.currentUser.uid);
    notificationsRef = userRef.doc("Notifications").collection("Notis");
    blenderbotRef = firestore.collection("blenderbotBuffer");
  } else {
    // user is not signed in
    console.error("User is not signed in");
  }
});

function App() {
  const [user, loading] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>⚛MediBot💬</h1>
        {user ? <Notification /> : <p></p>} {/* if user signed in, show notis*/}
        <SignOut /> {/*always show sign out button*/}
      </header>
      <section>
        {!loading ? ( // if loading
          <section>{user ? <ChatRoom /> : <SignIn />}</section>
        ) : (
          <p>Loading.... :)</p>
        )}
      </section>
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

function Notification(props) {
  const query = notificationsRef.orderBy("createdAt");
  const [notifications, load] = useCollectionData(query);
  const [showNotis, setShowNotis] = useState(false);
  const [notisExist, setNotisExist] = useState(false);

  function checkNumNotis() {
    if (notifications !== undefined && notifications.length > 0) {
      setNotisExist(true);
    } else setNotisExist(false);
  }

  React.useEffect(() => {
    checkNumNotis();
  }, [notifications]);

  let clickHandler = () => {
    let temp = !showNotis;
    setShowNotis(temp);
  };

  return (
    <div className="not">
      <div className="notiBox" onClick={clickHandler}>
        <img className="notifiBell" src={notiBell}></img>
      </div>
      {showNotis && (
        <div>
          <img className="tinyTriangle" src={tinyTriangle}></img>
          <div className="notiList">
            {notisExist ? (
              notifications.map((message) => (
                <NotificationMessage message={message} />
              ))
            ) : (
              <p className="noti">No notifications to show.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationMessage(props) {
  const { text } = props.message;
  return (
    <div>
      <p className="noti">{text}</p>
    </div>
  );
}

function SignOut() {
  // if there is user, auth.currentuser will be false, and sign out wont be shown
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
  let userid = auth.currentUser.uid;
  const messagesRef = userRef.doc("Messages").collection("Msg");
  const query = messagesRef.orderBy("createdAt");
  const [messages, load] = useCollectionData(query);
  const nickname = "";
  let msgLength = 0;
  if (load === false) {
    msgLength = messages.length;
  }

  const [showAddNickname, setShowAddNickname] = useState(false);
  const [showAddDS, setShowAddDS] = useState(false);

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
    await blenderbotRef.doc("InputOutput").set({
      input: formValue,
      collection: userid,
      doc: docName,
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
  let clickHandler = (val) => {
    props.checkShowAddNickname();
    props.checkShowAddDS();
    let docName = "NicknameAdded";
    notificationsRef.doc(docName).set({
      text: "Welcome to Medibot, " + val + "!",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
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

          <button
            type="submit"
            disabled={!formValue}
            onClick={clickHandler(formValue)}
          >
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

  let docName = "DSuploaded";

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setFilePicked(true);
  };

  let clickHandler = () => {
    userStorageRef
      .child("dischargeSummary/dischargeSummary.txt")
      .put(selectedFile)
      .then((snapshot) => {
        notificationsRef.doc(docName).set({
          text: "Discharge Summary has been uploaded successfully!",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });
    metadataRef.update({ hasDischargeSummary: true });
    props.checkShowAddDS();
  };

  return (
    <div>
      {
        <div className="dsupload">
          <p>Hello! Please upload your Discharge Summary to MediBot.</p>
          <input
            type="file"
            id="discharge-summary-file"
            title=" "
            className="dsInput"
            onChange={changeHandler}
          />
          <div className="buttons">
            <label for="discharge-summary-file" className="upload-box">
              <img className="uploadPic" src={upload}></img>
            </label>
            <button className="submitDS" onClick={clickHandler}>
              Submit
            </button>
          </div>
        </div>
      }
    </div>
  );
}

export default App;
