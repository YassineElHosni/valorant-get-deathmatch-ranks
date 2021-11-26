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
    chrome.scripting.insertCSS({
      target: {
        tabId: tab.id
      },
      files: ["css/theme.css", "/css/style.css"]
    })
    chrome.scripting.executeScript({
      target: {
        tabId: tab.id
      },
      files: ["/js/utils.js"]
    })
  }
})