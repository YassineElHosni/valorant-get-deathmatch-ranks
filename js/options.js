let page = document.getElementById("color_button");
let selectedClassName = "current";
const presetButtonColors = ["#3aa757", "#e8453c", "#f9bb2d", "#4688f1"];

const el = (tag, props = {}, ch = []) => ch.reduce((e, c) => (e.appendChild(c), e), Object.assign(document.createElement(tag), props))

const handleStoreSaved = () => {
  document.body.querySelector('#message').appendChild(
    el('div', {
      innerText: `Option saved !`
    })
  )
}

// Reacts to a button click by marking the selected button and saving
// the selection
function handleButtonClick(event) {
  // Remove styling from the previously selected color
  let current = event.target.parentElement.querySelector(
    `.${selectedClassName}`
  );
  if (current && current !== event.target) {
    current.classList.remove(selectedClassName);
  }

  // Mark the button as selected
  let color = event.target.dataset.color;
  event.target.classList.add(selectedClassName);
  chrome.storage.sync.set({
    color
  });
  handleStoreSaved()
}

// Reacts to an input value change and save the change
function handleUsernameInput(event) {
  chrome.storage.sync.set({
    player: {
      username: event.target.value
    }
  });
  handleStoreSaved()
}

// Add a button to the page for each supplied color
function constructColorOptions(buttonColors) {
  chrome.storage.sync.get("color", (data) => {
    let currentColor = data.color;
    // For each color we were provided…
    for (let buttonColor of buttonColors) {
      // …create a button with that color…
      let button = document.createElement("button");
      button.dataset.color = buttonColor;
      button.style.backgroundColor = buttonColor;

      // …mark the currently selected color…
      if (buttonColor === currentColor) {
        button.classList.add(selectedClassName);
      }

      // …and register a listener for when that button is clicked
      button.addEventListener("click", handleButtonClick);
      page.appendChild(button);
    }
  });
}

// Add a button to the page for each supplied color
function constructUsernameOption() {
  chrome.storage.sync.get("player", (data) => {
    let currentPlayer = data.player;
    let textInput = document.querySelector('#username')
    textInput.value = currentPlayer.username

    // …and register a listener for when that input changes
    textInput.addEventListener("input", handleUsernameInput);
  });
}

// // Initialize the page by constructing the color options
// constructColorOptions(presetButtonColors);

// Initialize the page by constructing the username option
constructUsernameOption();