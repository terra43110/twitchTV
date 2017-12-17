"use strict";

const broadcasters = [
    //    { name: 'cretetion' },
    //    { name: 'dnegspoker' },
    //    { name: 'doublelift' },
    //    { name: 'ESL_SC2' },
    //    { name: 'freecodecamp' },
    //    { name: 'habathcx' },
    //    { name: 'noobs2ninjas' },
    //    { name: 'OgamingSC2' },
    //    { name: 'RobotCaleb' },
    //    { name: 'storbeck' },

    // Overwatch Players
    { name: 'esl_alphacast' },
    { name: 'timthetatman' },
    { name: 'lirik' },
    { name: 'moonmoon_ow' },
    { name: 'xqcow' },
    { name: 'wraxu' },

    // Heartstone Players
    { name: 'amazhs' },
    { name: 'savjz' },
    { name: 'disguisedtoasths' },
    { name: 'trumpsc' },
    { name: 'day9tv' },
    { name: 'hsdogdog' },
];

$(document).ready( function() {
    testView.renderList(); // startup default: streams should all be offline
    test.init();
    // view.init();
});

const test = {
    init() {
        broadcasters.forEach(broadcaster => {
            return testHandler.getUsers(broadcaster.name)
            .then(data => {
                return testHandler.getStreams(data);
            })
            .then(([eachBroadcaster_user_id, eachBroadcaster_game_id]) => {
                if (Number(eachBroadcaster_game_id) === 488552 || Number(eachBroadcaster_game_id) === 138585) {
                    return testHandler.getStreamsMetadata(eachBroadcaster_user_id, eachBroadcaster_game_id);
                }
            })
            .then(() => {
                testView.renderList();
            })
            .then(() => {
                console.log('1 BROADCASTERS:\n', broadcasters); // LOG
            });
        });
    },
}

const testHandler = {
    getUsers(name) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let url = "https://api.twitch.tv/helix/users?login=" + name;
            xhr.open("GET", url, true);

            xhr.setRequestHeader("Accept", "application/vnd.twitchtv.v5+json");
            xhr.setRequestHeader("Client-ID", "h2rqah9nwupmw72azidd87krjmuxg9");

            xhr.onload = () => {
                let response = JSON.parse(xhr.responseText);

                for (const eachBroadcaster of broadcasters) {
                    if (name === eachBroadcaster.name) {
                        eachBroadcaster.users = response.data[0];
                    }
                }

                resolve(response.data[0]);
            };

            xhr.send(null);
        });
    },

    getStreams(data) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let url = 'https://api.twitch.tv/helix/streams?user_id=' + data.id;
            xhr.open('GET', url, true);

            xhr.setRequestHeader("Client-ID", "h2rqah9nwupmw72azidd87krjmuxg9");

            xhr.onload = () => {
                let response = JSON.parse(xhr.responseText);

                if (response.data.length > 0) {
                    for (const eachBroadcaster of broadcasters) {
                        if (eachBroadcaster.users.id && data.id === eachBroadcaster.users.id) {
                            eachBroadcaster.isStreaming = true;
                            eachBroadcaster.streams = response.data[0];

                            resolve([eachBroadcaster.users.id, eachBroadcaster.streams.game_id]);
                        }
                    }
                } else {
                    for (const eachBroadcaster of broadcasters) {
                        if (data.id === eachBroadcaster.id) {
                            eachBroadcaster.isStreaming = false;
                        }
                    }
                }
            };

            xhr.send(null);
        });
    },

    getStreamsMetadata(user_id, game_id) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const url = 'https://api.twitch.tv/helix/streams/metadata?user_id=' + user_id;
            xhr.open('GET', url, true);

            xhr.setRequestHeader("Client-ID", "h2rqah9nwupmw72azidd87krjmuxg9");

            xhr.onload = () => {
                let response = JSON.parse(xhr.responseText);

                // find correct broadcaster, then attach `streamsMetadata` property
                for (const eachBroadcaster of broadcasters) {
                    if (user_id === eachBroadcaster.users.id) {
                        eachBroadcaster.streamsMetadata = response.data[0];
                    }
                }

                resolve();
            };

            xhr.send(null);
        });
    },

    humanTimeFromUTC(utcTime) {
        /*
         * argument should be UTC time, retrieved from Twitch API
         */

        let humanTime = new Date(utcTime);

        return humanTime.toLocaleDateString() + " " + humanTime.toLocaleTimeString();
    },
};

const testView = {
    renderList() {
        const div_broadcasters = document.getElementById('div-broadcasters');
        div_broadcasters.innerHTML = '';

        broadcasters.forEach(broadcaster => {
            const broadcasterItem = document.createElement('li');
            const a = document.createElement('a');

            a.className = "list-group-item";
            a.href = `https://www.twitch.tv/${broadcaster.name}`;
            a.target = "_blank";

            broadcasterItem.append(a);

            if (broadcaster.isStreaming) {
                a.innerHTML = `<h4 class="list-group-item-heading">
                                 <img class="profile-image" src="${broadcaster.users.profile_image_url}" />
                                 ${broadcaster.users.display_name}
                                 <span class="badge" id="badge-online">Online</span>
                                 <br>${broadcaster.users.description}
                               </h4>
                               <p class="list-group-item-text">${broadcaster.streams.viewer_count.toLocaleString()} watching</p>
                               <p class="list-group-item-text">stream type: ${broadcaster.streams.type}</p>
                               <p class="list-group-item-text">stream started: ${testHandler.humanTimeFromUTC(broadcaster.streams.started_at)}</p>`;

                if (Number(broadcaster.streams.game_id) === 488552 && broadcaster.streamsMetadata) { // Overwatch
                    if (broadcaster.streamsMetadata.overwatch.broadcaster.hero) {
                        const hero = document.createElement('ul');

                        hero.innerHTML += `<li>hero name: ${broadcaster.streamsMetadata.overwatch.broadcaster.hero.name}</li>`;
                        hero.innerHTML += `<li>hero role: ${broadcaster.streamsMetadata.overwatch.broadcaster.hero.role}</li>`;
                        hero.innerHTML += `<li>hero ability: ${broadcaster.streamsMetadata.overwatch.broadcaster.hero.ability}</li>`;

                        a.append(hero);
                    }
                } else if (Number(broadcaster.streams.game_id) === 138585 && broadcaster.streamsMetadata) { // Heartstone
                    try {
                        if (broadcaster.streamsMetadata.hearthstone.broadcaster.hero) {
                            const hero = document.createElement('ul');

                            hero.innerHTML += `<li>hero name: ${broadcaster.streamsMetadata.hearthstone.broadcaster.hero.name}</li>`;
                            hero.innerHTML += `<li>hero class: ${broadcaster.streamsMetadata.hearthstone.broadcaster.hero.class}</li>`;
                            hero.innerHTML += `<li>hero type: ${broadcaster.streamsMetadata.hearthstone.broadcaster.hero.type}</li>`;

                            a.append(hero);
                        }
                        if (broadcaster.streamsMetadata.hearthstone.opponent.hero) {
                            const opponent = document.createElement('ul');

                            opponent.innerHTML += `<li>opponent name: ${broadcaster.streamsMetadata.hearthstone.opponent.hero.name}</li>`;
                            opponent.innerHTML += `<li>opponent class: ${broadcaster.streamsMetadata.hearthstone.opponent.hero.class}</li>`;
                            opponent.innerHTML += `<li>opponent type: ${broadcaster.streamsMetadata.hearthstone.opponent.hero.type}</li>`;

                            a.append(opponent);
                        }
                    } catch(e) {
                        console.error(e.stack);
                    }
                }
            } else {
                broadcasterItem.innerHTML = `<a href="#" class="list-group-item">
                                               <h4 class="list-group-item-heading">
                                                 ${broadcaster.name}
                                                 <span class="badge" id="badge-offline">Offline</span>
                                               </h4>
                                             </a>`;
            }

            div_broadcasters.append(broadcasterItem);
        });
    },
};

const sample = [
  {
    "stream": {
      "mature": false,
      "status": "Greg working on Electron-Vue boilerplate w/ Akira #programming #vuejs #electron",
      "broadcaster_language": "en",
      "display_name": "FreeCodeCamp",
      "game": "Creative",
      "language": "en",
      "_id": 79776140,
      "name": "freecodecamp",
      "created_at": "2015-01-14T03:36:47Z",
      "updated_at": "2016-09-17T05:00:52Z",
      "delay": null,
      "logo": "https://static-cdn.jtvnw.net/jtv_user_pictures/freecodecamp-profile_image-d9514f2df0962329-300x300.png",
      "banner": null,
      "video_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/freecodecamp-channel_offline_image-b8e133c78cd51cb0-1920x1080.png",
      "background": null,
      "profile_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/freecodecamp-profile_banner-6f5e3445ff474aec-480.png",
      "profile_banner_background_color": null,
      "partner": false,
      "url": "https://www.twitch.tv/freecodecamp",
      "views": 161989,
      "followers": 10048,
      "_links": {
        "self": "https://api.twitch.tv/kraken/channels/freecodecamp",
        "follows": "https://api.twitch.tv/kraken/channels/freecodecamp/follows",
        "commercial": "https://api.twitch.tv/kraken/channels/freecodecamp/commercial",
        "stream_key": "https://api.twitch.tv/kraken/channels/freecodecamp/stream_key",
        "chat": "https://api.twitch.tv/kraken/chat/freecodecamp",
        "subscriptions": "https://api.twitch.tv/kraken/channels/freecodecamp/subscriptions",
        "editors": "https://api.twitch.tv/kraken/channels/freecodecamp/editors",
        "teams": "https://api.twitch.tv/kraken/channels/freecodecamp/teams",
        "videos": "https://api.twitch.tv/kraken/channels/freecodecamp/videos"
      }
    },
    "_links": {
      "self": "https://api.twitch.tv/kraken/streams/freecodecamp",
      "channel": "https://api.twitch.tv/kraken/channels/freecodecamp"
    }
  },
  {
    "stream": null,
    "display_name": "OgamingSC2",
    "_links": {
      "self": "https://api.twitch.tv/kraken/streams/ogamingsc2",
      "channel": "https://api.twitch.tv/kraken/channels/ogamingsc2"
    }
  },
  {
    "stream": {
      "mature": false,
      "status": "RERUN: StarCraft 2 - Kane vs. HuK (ZvP) - WCS Season 3 Challenger AM - Match 4",
      "broadcaster_language": "en",
      "display_name": "ESL_SC2",
      "game": "StarCraft II",
      "language": "en",
      "_id": 30220059,
      "name": "esl_sc2",
      "created_at": "2012-05-02T09:59:20Z",
      "updated_at": "2016-09-17T06:02:57Z",
      "delay": null,
      "logo": "https://static-cdn.jtvnw.net/jtv_user_pictures/esl_sc2-profile_image-d6db9488cec97125-300x300.jpeg",
      "banner": null,
      "video_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/esl_sc2-channel_offline_image-5a8657f8393c9d85-1920x1080.jpeg",
      "background": null,
      "profile_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/esl_sc2-profile_banner-f8295b33d1846e75-480.jpeg",
      "profile_banner_background_color": "#050506",
      "partner": true,
      "url": "https://www.twitch.tv/esl_sc2",
      "views": 60843789,
      "followers": 135275,
      "_links": {
        "self": "https://api.twitch.tv/kraken/channels/esl_sc2",
        "follows": "https://api.twitch.tv/kraken/channels/esl_sc2/follows",
        "commercial": "https://api.twitch.tv/kraken/channels/esl_sc2/commercial",
        "stream_key": "https://api.twitch.tv/kraken/channels/esl_sc2/stream_key",
        "chat": "https://api.twitch.tv/kraken/chat/esl_sc2",
        "subscriptions": "https://api.twitch.tv/kraken/channels/esl_sc2/subscriptions",
        "editors": "https://api.twitch.tv/kraken/channels/esl_sc2/editors",
        "teams": "https://api.twitch.tv/kraken/channels/esl_sc2/teams",
        "videos": "https://api.twitch.tv/kraken/channels/esl_sc2/videos"
      }
    },
    "_links": {
      "self": "https://api.twitch.tv/kraken/streams/esl_sc2",
      "channel": "https://api.twitch.tv/kraken/channels/esl_sc2"
    }
  },
  {
    "stream": null,
    "display_name": "noobs2ninjas",
    "_links": {
      "self": "https://api.twitch.tv/kraken/streams/esl_sc2",
      "channel": "https://api.twitch.tv/kraken/channels/esl_sc2"
    }
  },
  {
    "error": "Not Found",
    "status": 404,
    "message": "Channel 'not-a-valid-account' does not exist"
  }
];


// NOTE: previous template


let model = {
    isPortrait: undefined,

    // handlers.detectDevice()
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,

    // lists
    divsOfChannels: [], // HTMLCollection
    channelNames: []    // strings
};

// TODO: User Story: I can see whether Free Code Camp is currently streaming on Twitch.tv.

/*
 * I. will be getting Names
 * ------------------------
 *   DONE 1. Names from list of divs, each representing a channel
 *   2. (optional) Name from search bar
 *
 * II. will get UserID from Names
 * ------------------------------
 *   1. XHR to Twitch API
 *
 * III. use userID to get info from User endpoint
 * ----------------------------------------------
 *   1. see Reference for details
 */

const view = {
    init() {
        view.setupEventListeners();
    },

    setupEventListeners() {
    }
};

let _view = {
    init() {
        view.setupEventListeners();
        handlers.detectOrientation()/*XXX:DELETE*/.then((bool) => { console.log("promise returned: " + bool); })/*XXX ;*/
                .then( handlers.getNames() );
        handlers.getID("freeCodeCamp");
    },

    setupEventListeners() {
        window.addEventListener("orientationchange", handlers.detectOrientation);
    }
};

const handlers = {
    getNames(array) {
        console.log("TRACE: handlers.getNames"); // LOG
        document.getElementsByClassName("list-group-item");
        model.divsOfChannels = document.getElementsByClassName("list-group-item");
        Array.from(model.divsOfChannels).forEach( (div) => { model.channelNames.push(div.textContent) } );
        console.log(model.divsOfChannels); // LOG
        console.log(model.channelNames); // LOG
    },

    detectOrientation() {
        console.log("TRACE: handlers.detectOrientation"); // LOG
        return new Promise( (resolve, reject) => {
            window.screen.orientation.type === "portrait-primary" ? resolve(model.isPortrait = true)
                                                                  : resolve(model.isPortrait = false);
            reject();
        });
    },

    detectDevice() {
        let deviceWidth = window.innerWidth;

        if (model.isPortrait) {
            if (deviceWidth < 432) {
                model.isMobile = true;
            } else if (deviceWidth < 558) {
                model.isTablet = true;
            } else if (deviceWidth < 675) {
                model.isDesktop = true;
            } else {
                model.isLargeDesktop = true;
            }
        } else {
            if (deviceWidth < 768) {
                model.isMobile = true;
            } else if (deviceWidth < 992) {
                model.isTablet = true;
            } else if (deviceWidth < 1200) {
                model.isDesktop = true;
            } else {
                model.isLargeDesktop = true;
            }
        }

        // TEST
        // console.log("device is mobile: " + model.isMobile);
        // console.log("device is tablet: " + model.isTablet);
        // console.log("device is desktop: " + model.isDesktop);
        // console.log("device is large desktop: " + model.isLargeDesktop);
    }
};

let _handlers = {
    getNames(array) {
        console.log("TRACE: handlers.getNames"); // LOG
        model.divsOfChannels = document.getElementsByClassName("list-group-item");
        Array.from(model.divsOfChannels).forEach( (div) => { model.channelNames.push(div.textContent) } );
        console.log(model.divsOfChannels); // LOG
        console.log(model.channelNames); // LOG
    },

    getUserIDfromUserName(nameList) {
        console.log("TRACE: handlers.getUserIDfromUserName"); // LOG
    },

    getID(name) {
        console.log("TRACE: handlers.getID"); // LOG
        let xhr = new XMLHttpRequest();
        let url = "https://api.twitch.tv/kraken/users?login=" + name;
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Accept", "application/vnd.twitchtv.v5+json");
        xhr.setRequestHeader("Client-ID", "h2rqah9nwupmw72azidd87krjmuxg9");
        xhr.onload = () => {
            let data = JSON.parse(xhr.responseText);
            let id;
            console.log(data); // LOG
            id = data.users[0]._id;
            console.log(id); // LOG
            return id;
        };
        xhr.send(null);
    },

    detectOrientation() {
        console.log("TRACE: handlers.detectOrientation"); // LOG
        return new Promise( (resolve, reject) => {
            window.screen.orientation.type === "portrait-primary" ? resolve(model.isPortrait = true)
                                                                  : resolve(model.isPortrait = false);
            reject();
        });
    },

    detectDevice() {
        let deviceWidth = window.innerWidth;

        if (model.isPortrait) {
            if (deviceWidth < 432) {
                model.isMobile = true;
            }
            else if (deviceWidth < 558) {
                model.isTablet = true;
            }
            else if (deviceWidth < 675) {
                model.isDesktop = true;
            }
            else {
                model.isLargeDesktop = true;
            }
        zz}
        else {
            if (deviceWidth < 768) {
                model.isMobile = true;
            }
            else if (deviceWidth < 992) {
                model.isTablet = true;
            }
            else if (deviceWidth < 1200) {
                model.isDesktop = true;
            }
            else {
                model.isLargeDesktop = true;
            }
        }

        // TEST
        // console.log("device is mobile: " + model.isMobile);
        // console.log("device is tablet: " + model.isTablet);
        // console.log("device is desktop: " + model.isDesktop);
        // console.log("device is large desktop: " + model.isLargeDesktop);
    }
};




