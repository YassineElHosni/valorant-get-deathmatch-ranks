let hasTarget = false
let hasLoaded = false
const checker = setInterval(()=>{
  let target = document.querySelectorAll("div.flex.agent span.trn-ign")
  // console.log(hasTarget, hasLoaded, '--check if', target?.length>0)
  if(target?.length>0){
    hasTarget = true
    if(!hasLoaded){
      // run once
      trackerGGAddon()
    }
    hasLoaded = true
  }else {
    hasTarget = false
    hasLoaded = false
  }
}, 1000);
const trackerGGAddon = () => {
  console.log('---running---')
  try {

    const DEATHMATCH = "deathmatch",
      COMPETITIVE = "competitive";

    const fetchOptions = {
      method: "GET",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept",
      },
    };

    const getUserMatches = (username, type) =>
      fetch(
        `https://api.tracker.gg/api/v2/valorant/standard/matches/riot/${username.replace(
          "#",
          "%23"
        )}?type=${type}`,
        fetchOptions
      ).then((response) => response.json());

    const getPlayerRank = (username, i) => {
      return getUserMatches(username, COMPETITIVE)
        .then((data) => {
          if (data.errors) {
            console.log(i, "fetching-results-->", username, "-->", {
              username,
              rank: "private",
            });
            updateDisplay(i, "private");
          }
          const playerRank = ({ iconUrl, tierName } =
            data.data.matches[0].segments[0].stats.rank.metadata);
          console.log(i, "fetching-results-->", username, "-->", {
            username,
            rank: playerRank,
          });
          updateDisplay(i, playerRank);
        })
        .catch((e) => {
          //   console.error("getPlayerRank - got an error -", e);
          console.log(i, "fetching-results-->", username, "-->", {
            username,
            rank: "unknown",
          });
          updateDisplay(i, "unknown");
        });
    };

    const el = (tag, props = {}, ch = []) =>
      ch.reduce(
        (e, c) => (e.appendChild(c), e),
        Object.assign(document.createElement(tag), props)
      );

    let list = document.querySelectorAll("div.flex.agent span.trn-ign");
    let listForIcon = document.querySelectorAll("div.flex.agent div.agent-icon");

    let getTargets = () => {
      console.log('---getTargets running -', list, listForIcon)

      list.forEach((o, i) => {
        const target =
          o.querySelector(".trn-ign__username").innerText +
          "" +
          o.querySelector(".trn-ign__discriminator").innerText;
        console.log("fetching-->", target);
        getPlayerRank(target, i);
      });
    };

    let updateDisplay = (i, rank) => {
      const target = listForIcon[i];
      const isPrivateOrUnknown = rank === "private" || rank === "unknown";
      const srcToAdd = isPrivateOrUnknown
        ? "https://www.psdstamps.com/wp-content/uploads/2020/03/grunge-private-label-png.png"
        : rank.iconUrl;
      const privateStype =
        "width: 34px; transform: rotateZ(331deg); border-radius: 50%; position: absolute; top: 0; left: 0px";
      if (target.childNodes.length == 1) {
        //   target.querySelector(".addon_rank_target").src = srcToAdd;
        //   target.querySelector(".addon_rank_target").style = privateStype;
        // } else {
        if (!isPrivateOrUnknown) target.style = "width: 4rem;";
        const newItem = el("img", {
          class: "addon_rank_target",
          src: srcToAdd,
          width: 25,
          style: isPrivateOrUnknown ? privateStype : "",
        });
        target.insertBefore(newItem, target.childNodes[0]);
      }
    };
    getTargets();

  } catch (error) {
    console.log('---something went wrong - ', error)
  }
};
// trackerGGAddon();

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text === 'are_you_there_content_script?') {
    console.log('---content script recived:', msg.text)
    sendResponse({ status: "yes_i_am_here_background_script" });
    // trackerGGAddon();
  }
});