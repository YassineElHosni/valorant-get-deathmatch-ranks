let color = '#3aa757';
let player = {
  username: 'merlosan#EUW'
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    color,
    player
  });
  console.log('Default background color set to %cgreen', `color: ${color}`);
  console.log('Default background player set to %cgreen', `player: ${player.name}#${player.tag}`);
});