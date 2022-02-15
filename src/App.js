import logo from "./logo.svg";
import "./App.css";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>⚛MediBot💬</h1>
      </header>
      <section className="body"></section>
    </div>
  );
}

export default App;
