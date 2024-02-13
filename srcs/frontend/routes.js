import { indexPage } from "./page.js";
import { localpvpPage } from "./game/local_pvp/page.js";
import { multiPage } from "./game/multi/page.js";
import { tournamentPage } from "./game/tournament/page.js";
import { createScriptTag } from "./game/createScriptTag.js";

export const routes = [
        {
                path: '/',
                template: indexPage(),
                script: createScriptTag('')
        },
        {
                path: '/local',
                template: localpvpPage(),
                script: createScriptTag('./game/local_pvp/pongLocal.js')
        },
        {
                path: '/tournament',
                template: tournamentPage(),
                script: createScriptTag('./game/tournament/pongTour.js')
        },
        {
                path: '/multi',
                template: multiPage(),
                script: createScriptTag('./game/multi/ws.js')
        },
];
