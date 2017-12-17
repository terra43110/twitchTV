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
