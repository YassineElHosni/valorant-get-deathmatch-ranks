// Initialize button with user's preferred color
let inject_scripts = document.getElementById("inject_scripts")

// chrome.storage.sync.get("color", ({
//   color
// }) => {
//   inject_scripts.style.backgroundColor = color
// })

let current_username = document.getElementById("current_username")
chrome.storage.sync.get("player", ({player}) => {
  current_username.innerText = player.username
})

// When the button is clicked, inject setPageBackgroundColor into current page
inject_scripts.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })
  chrome.scripting.insertCSS({
    target: {
      tabId: tab.id
    },
    files: ["/css/style.css"]
  })
  chrome.scripting.executeScript({
    target: {
      tabId: tab.id
    },
    files: ["/js/utils.js"]
  })
})