import { indexPage } from "./page.js";
import { localpvpPage } from "./game/local_pvp/page.js";
import { local3dPage } from "./game/local_3d/page.js";
import { multiPage } from "./game/multi/page.js";
import { tournamentPage } from "./game/tournament/page.js";
import { createScriptTag } from "./game/createScriptTag.js";

export const routes = [
        {
                path: '/',
                name: 'WELCOME TO TRANSCENDENCE',
                template: indexPage(),
                script: createScriptTag('')
        },
        {
                path: '/local',
                name: 'LOCAL GAME',
                template: localpvpPage(),
                script: createScriptTag('/static/game/local_pvp/pongLocal.js')
        },
        {
                path: '/local_3d',
                name: 'LOCAL 3D GAME',
                template: local3dPage(),
                script: createScriptTag('/static/game/local_3d/pongLocal3d.js')
        },
        {
                path: '/tournament',
                name: 'TOURNAMENT GAME',
                template: tournamentPage(),
                script: createScriptTag('/static/game/tournament/pongTour.js')
        },
        {
                path: '/multi',
                name: 'MULTI GAME',
                template: multiPage(),
                script: createScriptTag('/static/game/multi/pongMulti.js')
        },
];
