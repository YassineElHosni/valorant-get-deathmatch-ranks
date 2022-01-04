let color = '#3aa757'
let player = {
  username: 'merlosan#EUW'
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    color,
    player
  })
  console.log('Default background color set to %cgreen', `color: ${color}`)
  console.log('Default background player set to %cgreen', `player: ${player.name}#${player.tag}`)
})
let curre
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    'url': 'https://tracker.gg/valorant'
  }, (tab) => {
    // chrome.tabs.onCreated.addListener(
    //   function () {
    // chrome.scripting.insertCSS({
    //   target: {
    //     tabId: tab.id
    //   },
    //   files: ["css/theme.css", "/css/style.css"]
    // })
    // chrome.scripting.executeScript({
    //   target: {
    //     tabId: tab.id
    //   },
    //   files: ["/js/utils.js"]
    // })
    //   }
    // )
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.match(/^https:\/\/tracker.gg\/valorant/) != null) {
    console.log(`--Target is tabId°${tabId}`)
    // chrome.scripting.insertCSS({
    //   target: {
    //     tabId: tab.id
    //   },
    //   files: ["css/theme.css", "/css/style.css"]
    // })
    // chrome.scripting.executeScript({
    //   target: {
    //     tabId: tab.id
    //   },
    //   files: ["/js/trackerGGAddon.js"]
    // })
    chrome.tabs.sendMessage(tabId, { text: "are_you_there_content_script?" }, function (msg) {
      msg = msg || {};
      if (msg.status == 'yes_i_am_here_background_script'){
        console.log('---background script recived:', msg.status)
      } else {
        chrome.scripting.executeScript({
          target: {
            tabId: tab.id
          },
          files: ["/js/trackerGGAddon.js"]
        })
      }
    });
  }
})

// chrome.tabs.onActivated.addListener(function (activeInfo) {
//   tabId = activeInfo.tabId
//   chrome.tabs.sendMessage(tabId, { text: "are_you_there_content_script?" }, function (msg) {
//     msg = msg || {};
//     if (msg.status == 'yes_i_am_here_background_script'){
//       console.log('---background script recived:', msg.status)
//     } else {
//       chrome.scripting.executeScript({
//         target: {
//           tabId
//         },
//         files: ["/js/trackerGGAddon.js"]
//       })
//     }
//   });
// });