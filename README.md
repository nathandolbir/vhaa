# Virtual Health Assistant Firebase-React Project

This readme will briefly describe this project, as it is set up. Some code which is worthy of explanation will be discussed here, while others will have short annotations within the code itself. If you have any questions or concerns, please ask away to nathandolbir@gmail.com

## Getting started

To start the application on http://localhost:3000 port, access the project directory and run

### `yarn start`

The page will reload when you make changes and hit 'save' anywhere in the directory.

### App.js

This is the file where all the React magic happens. The entire HTML document object model (DOM) is rendered from the React components specified in here.

#### Line 1

These are React hooks. React makes it easy to update parts of your UI or The DOM updates ONLY when specified a specified state of a React component changes. For example:

```

function ButtonColor() {
  const [buttonColor, setButtonColor] = useState("#3aeb34");
  const clickHandler = () => {
    setButtonColor("#dc34eb");
  };
  return (
    <button style={{ color: buttonColor }} onClick={clickHandler}>
      Hello
    </button>
  );
}
```

This function, on a page, would show a button that changes text color from green to pink, without needing to do any complex event handling. This is because we set a buttonColor to be a state of the function, and for the CSS attribute "color" to reflect whatever string buttonColor presents. Clicking the button would call clickHandler, which would change the button. Beware that you must have such a clickHandler function, as calling setButtonColor directly within the in-line CSS would cause React to rerender too many times.

#### Line 11-12

These are state hooks which allow you to use firebase information as states of your React app. This is very useful, as components will rerender whenever something in the Firebase backend changes.

useAuthState checks if user is authenticated or not; useCollectionData monitors a firestore collection; there are other react-firebase hooks to use, like useDocumentData, which could be explored.

#### App( )

This is the main function where all other components rest within. It can be thought of as the blank page where everything else is put on top of. Try to only make component changes within the component themselves.
