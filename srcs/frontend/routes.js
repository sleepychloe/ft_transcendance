import { indexPage } from "./page.js";
import { localpvpPage } from "./game/local_pvp/page.js";
import { multiPage } from "./game/multi/page.js";
import { tournamentPage } from "./game/tournament/page.js";

export const routes = [
        {
                path: '/',
                template: indexPage()
        },
        {
                path: '/local',
                template: localpvpPage()
        },
        {
                path: '/tournament',
                template: tournamentPage()
        },
        {
                path: '/multi',
                template: multiPage()
        },
];
