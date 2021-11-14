try {
    store
    setUp()
} catch (e) {

    const store = {
        currentPlayer: {
            username: ''
        },
        currentMatch: {
            id: ''
        },
        players: [],
    }

    const StoreManager = {
        setCurrentPlayer: (player) => {
            store.currentPlayer.username = player.username
        },
        setCurrentMatch: (id) => {
            store.currentMatch.id = id
        },
        setPlayers: (players) => {
            store.players = players
        },
        setPlayer: (player) => {
            console.log('player', player)
            const targetId = store.players.findIndex(o => o.username === player.username)
            store.players[targetId].rank = player.rank
        }
    }

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

    const sortingPlayersByPublicRank = (a, b) => {
        if (typeof a.rank == "string" && typeof b.rank == "string") return 0
        if (typeof a.rank == "string" && typeof b.rank != "string") return 1
        if (typeof a.rank != "string" && typeof b.rank == "string") return -1
    }

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
                classList: [player.username === store.currentPlayer.username ? 'player_name_active' : 'player_name'],
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

    // get player deathmatch or competitive
    // parms: username
    // https://api.tracker.gg/api/v2/valorant/standard/matches/riot/Genis%239846?type=deathmatch
    // https://api.tracker.gg/api/v2/valorant/standard/matches/riot/merlosan%23EUW?type=competitive
    const getUserMatches = (username, type) =>
        fetch(`https://api.tracker.gg/api/v2/valorant/standard/matches/riot/${username.replace('#','%23')}?type=${type}`, fetchOptions)
        .then(response => response.json())

    const getMatchId = (username) => {
        return getUserMatches(username, DEATHMATCH)
            .then(data => {
                if (data.errors) {
                    return data
                }
                StoreManager.setCurrentMatch(data.data.matches[0].attributes.id)
                return data.data.matches[0].attributes.id
            })
            .catch(e => {
                console.log('getMatchId - got an error -', e)
            })
    }

    const getPlayerRank = (username) => {
        const callBack = (player) => {
            StoreManager.setPlayer(player)
            logger.info(`loading players of ranks(${store.players.filter(o => o.rank).length}/${store.players.length})...`)
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
                StoreManager.setPlayers(players)
                return players
            })
            .catch(e => {
                console.log('getPlayersOfMatch - got an error -', e)
            })
    }

    const logger = {
        info: (message) => {
            document.body.querySelector('#message').innerText = message
        },
        infoHTML: (message) => {
            document.body.querySelector('#message').innerHTML = message
        }
    }

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

    const setUp = async () => {
        document.body.innerHTML = ''
        document.body.appendChild(getMessageDiv())

        console.log('location', window.location)
        if (window.location.href !== API_TARGET) {
            logger.infoHTML(`<h1>Wrong Target, please try here: <a href="${API_TARGET}">${API_TARGET}</a></h1>`)
            return
        }

        document.body.appendChild(getListHtml())

        const allStorageSyncData = await getAllStorageSyncData()
        console.log('getAllStorageSyncData', allStorageSyncData)
        StoreManager.setCurrentPlayer(allStorageSyncData.player)

        logger.info('Loading latest match id...')
        let results = await getMatchId(store.currentPlayer.username)
        console.log('getMatchId results', results)
        if (results.errors) {
            logger.info(`The selected User is private XD`)
            return
        }
        logger.info(`Current match id=${store.currentMatch.id}`)

        logger.info(`Loading players of match (${store.currentMatch.id})...`)
        await getPlayersOfMatch(store.currentMatch.id)
        logger.info(`${store.players.length} players have been found !`)

        await Promise.all(store.players.map(o => getPlayerRank(o.username)))
        logger.info(`loading complete !`)

        console.log('store', store)

        store.players.sort(sortingPlayersByPublicRank).forEach(o => {
            document.body.querySelector('#players_list').appendChild(getListItemHtml(o))
        })
    }
    setUp()

}