try {
  temporaryStorage
  // setUp()
  const data_popup = genereateDataPopup()
  genereateSidePopup(data_popup)
} catch (e) {

  //#region TemporaryStorage
  const temporaryStorage = {
    currentPlayer: {
      username: ''
    },
    currentMatch: {
      id: ''
    },
    players: [],
  }

  const temporaryStorageManager = {
    setCurrentPlayer: (player) => {
      temporaryStorage.currentPlayer.username = player.username
    },
    setCurrentMatch: (id) => {
      temporaryStorage.currentMatch.id = id
    },
    setPlayers: (players) => {
      temporaryStorage.players = players
    },
    setPlayer: (player) => {
      console.log('player', player)
      const targetId = temporaryStorage.players.findIndex(o => o.username === player.username)
      temporaryStorage.players[targetId].rank = player.rank
    }
  }
  //#endregion TemporaryStorage

  //#region Constants
  const API_TARGET = 'https://api.tracker.gg/api/v2/valorant/standard/matches/riot'

  const DEATHMATCH = "deathmatch",
    COMPETITIVE = "competitive"

  const fetchOptions = {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    }
  }
  //#endregion Constants

  const sortingPlayersByPublicRank = (a, b) => {
    if (typeof a.rank == "string" && typeof b.rank == "string") return 0
    if (typeof a.rank == "string" && typeof b.rank != "string") return 1
    if (typeof a.rank != "string" && typeof b.rank == "string") return -1
  }

  //#region HTMLGenerators
  const el = (tag, props = {}, ch = []) => ch.reduce((e, c) => (e.appendChild(c), e), Object.assign(document.createElement(tag), props))

  const getListHtml = () => {
    return el('div', {
      id: 'players_list'
    }, [])
  }
  const getMessageDiv = () => {
    return el('div', {
      id: 'message',
      innerText: 'loading...'
    }, [])
  }
  const getListItemHtml = (player) => {
    return el('div', {
      classList: ['player_item']
    }, [
      el('h3', {
        classList: [player.username === temporaryStorage.currentPlayer.username ? 'player_name_active' : 'player_name'],
        innerText: `${player.username}`
      }),
      el('div', {
        classList: ['player_rank'],
        innerHTML: player.rank === 'unkown' || player.rank === 'private' ? player.rank : (
          `<img src="${player.rank.iconUrl}"/>
                    <h4>${player.rank.tierName}</h4>`
        )
      }),
    ])
  }

  const getPlayerItemHtml = (o) => el('div', {
    classList: ['valorant_get_hidden_ranks_data_list_item'],
  }, [
    el('div', {
      classList: ['valorant_get_hidden_ranks_data_list_item_username'],
      innerText: o.username,
    }),
    el('div', {
      classList: ['valorant_get_hidden_ranks_data_list_item_rank'],
    }, o.rank?.tierName ? [
      el('img', {
        classList: ['valorant_get_hidden_ranks_data_list_item_rank_image'],
        src: o.rank?.iconUrl,
        alt: '!'
      }),
      el('div', {
        classList: ['valorant_get_hidden_ranks_data_list_item_rank_title'],
        innerText: o.rank?.tierName || 'private'
      }),
    ] : []),
  ])

  const getSidePopupHTML = () => el('div', {
    id: 'valorant_get_hidden_ranks_popup'
  }, [
    el('h4', {
      innerText: 'Get last game hidden ranks'
    })
  ])

  const getDataPopupHTML = () => el('div', {
    id: 'valorant_get_hidden_ranks_data'
  }, [
    el('div', {
      id: 'valorant_get_hidden_ranks_data_current_gamemode',
    }, [
      el('input', {
        id: 'valorant_get_hidden_ranks_data_current_gamemode_unrated',
        type: 'button',
        value: 'UNRATED'
      }),
      el('input', {
        id: 'valorant_get_hidden_ranks_data_current_gamemode_deathmatch',
        type: 'button',
        value: 'DEATHMATCH'
      })
    ]),
    el('div', {
      id: 'valorant_get_hidden_ranks_data_current_user',
    }, [
      el('img', {
        id: 'valorant_get_hidden_ranks_data_current_user_image',
        src: 'some image',
        alt: '!'
      }),
      el('div', {
        id: 'valorant_get_hidden_ranks_data_current_user_username',
        innerText: '[username]'
      }),
    ]),
    el('div', {
      id: 'valorant_get_hidden_ranks_data_search_bar',
    }, [
      el('input', {
        type: 'text',
        placeholder: 'Search using a diffrent username'
      })
    ]),
    el('div', {
      id: 'valorant_get_hidden_ranks_data_list',
    },
      // [...Array(14)].map((o, i) =>
      //   el('div', {
      //     classList: ['valorant_get_hidden_ranks_data_list_item'],
      //     innerText: `user00${i+1}#tag00${i+1} Rank00${i+1}`
      //   })
      // )
    )
  ])
  //#endregion HTMLGenerators

  //#region Api

  // get player deathmatch or competitive
  // parms: username
  // https://api.tracker.gg/api/v2/valorant/standard/matches/riot/Genis%239846?type=deathmatch
  // https://api.tracker.gg/api/v2/valorant/standard/matches/riot/merlosan%23EUW?type=competitive
  const getUserMatches = (username, type) =>
    fetch(`https://api.tracker.gg/api/v2/valorant/standard/matches/riot/${username.replace('#', '%23')}?type=${type}`, fetchOptions)
      .then(response => response.json())

  const getMatchId = (username) => {
    return getUserMatches(username, DEATHMATCH)
      .then(data => {
        if (data.errors) {
          return data
        }
        temporaryStorageManager.setCurrentMatch(data.data.matches[0].attributes.id)
        return data.data.matches[0].attributes.id
      })
      .catch(e => {
        console.log('getMatchId - got an error -', e)
      })
  }

  const getPlayerRank = (username) => {
    const callBack = (player) => {
      temporaryStorageManager.setPlayer(player)
      logger.info(`loading players of ranks(${temporaryStorage.players.filter(o => o.rank).length}/${temporaryStorage.players.length})...`)
      return player
    }
    return getUserMatches(username, COMPETITIVE)
      .then(data => {
        if (data.errors) {
          return callBack({
            username,
            rank: 'private'
          })
        }
        const playerRank = {
          iconUrl,
          tierName
        } = data.data.matches[0].segments[0].stats.rank.metadata
        return callBack({
          username,
          rank: playerRank
        })
      })
      .catch(e => {
        console.error('getPlayerRank - got an error -', e)
        return callBack({
          username,
          rank: 'unknown'
        })
      })
  }

  // get players from match id
  // params: match-id
  // https://api.tracker.gg/api/v2/valorant/standard/matches/a130efe6-3c8d-4a20-8bfa-08f8d14afe1a
  const getPlayersOfMatch = (matchId) => {
    return fetch(`https://api.tracker.gg/api/v2/valorant/standard/matches/${matchId}`, fetchOptions)
      .then(response => response.json())
      .then(data => {
        const players = data.data.segments.filter(o => o.type == "player-summary").map(o => o = {
          username: o.attributes.platformUserIdentifier
        })
        temporaryStorageManager.setPlayers(players)
        return players
      })
      .catch(e => {
        console.log('getPlayersOfMatch - got an error -', e)
      })
  }

  //#endregion Api

  const logger = {
    info: (message) => {
      // document.body.querySelector('#message').innerText = message
    },
    infoHTML: (message) => {
      // document.body.querySelector('#message').innerHTML = message
    }
  }

  //#region SyncStorage
  const getAllStorageSyncData = () => {
    // Immediately return a promise and start asynchronous work
    return new Promise((resolve, reject) => {
      // Asynchronously fetch all data from storage.sync.
      chrome.storage.sync.get(null, (items) => {
        // Pass any observed errors down the promise chain.
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        // Pass the data retrieved from storage down the promise chain.
        resolve(items);
      });
    });
  }
  //#endregion SyncStorage

  //#region Draw
  const setUp = async (data_target) => {
    // document.body.innerHTML = ''
    // document.body.appendChild(getMessageDiv())

    // console.log('location', window.location)
    // if (window.location.href !== API_TARGET) {
    //   logger.infoHTML(`<h1>Wrong Target, please try here: <a href="${API_TARGET}">${API_TARGET}</a></h1>`)
    //   return
    // }

    // document.body.appendChild(getListHtml())

    const allStorageSyncData = await getAllStorageSyncData()
    console.log('getAllStorageSyncData', allStorageSyncData)
    temporaryStorageManager.setCurrentPlayer(allStorageSyncData.player)

    logger.info('Loading latest match id...')
    let results = await getMatchId(temporaryStorage.currentPlayer.username)
    console.log('getMatchId results', results)
    if (results.errors) {
      logger.info(`The selected User is private XD`)
      return
    }
    logger.info(`Current match id=${temporaryStorage.currentMatch.id}`)

    logger.info(`Loading players of match (${temporaryStorage.currentMatch.id})...`)
    await getPlayersOfMatch(temporaryStorage.currentMatch.id)
    logger.info(`${temporaryStorage.players.length} players have been found !`)

    await Promise.all(temporaryStorage.players.map(o => getPlayerRank(o.username)))
    logger.info(`loading complete !`)

    console.log('temporaryStorage', temporaryStorage)

    temporaryStorage.players.sort(sortingPlayersByPublicRank).forEach(o => {
      // document.body.querySelector('#players_list')
      data_target.appendChild(getPlayerItemHtml(o))
    })
  }
  // setUp()
  let isPopupOpen = false
  const genereateSidePopup = (data_popup) => {
    document.body.appendChild(getSidePopupHTML())
    let target = document.querySelector('#valorant_get_hidden_ranks_popup')
    target.addEventListener('click', () => {
      console.log('/click.current:', isPopupOpen)
      isPopupOpen = !isPopupOpen
      console.log('\\click.next:', isPopupOpen)
      if (isPopupOpen) {
        document.querySelector('#valorant_get_hidden_ranks_data')
          .classList.add("valorant_get_hidden_ranks_data_active")
      } else {
        document.querySelector('#valorant_get_hidden_ranks_data')
          .classList.remove("valorant_get_hidden_ranks_data_active")
      }
    })
  }

  const genereateDataPopup = () => {
    document.body.appendChild(getDataPopupHTML())
    return document.querySelector('#valorant_get_hidden_ranks_data')
  }

  const data_popup = genereateDataPopup()
  genereateSidePopup(data_popup)
  setUp(document.querySelector('#valorant_get_hidden_ranks_data_list'))
  //#endregion Draw
}