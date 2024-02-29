import { indexPage } from "./page.js";
import { localpvpPage } from "./game/local_pvp/page.js";
import { local3dPage } from "./game/local_3d/page.js";
import { multiPage } from "./game/multi/page.js";
import { tournamentPage } from "./game/tournament/page.js";

const translations = {
	en: {
		'WELCOME TO TRANSCENDENCE':	'WELCOME TO TRANSCENDENCE',
		'LOCAL GAME':			'LOCAL GAME',
		'LOCAL 3D GAME':		'LOCAL 3D GAME',
		'TOURNAMENT GAME':		'TOURNAMENT GAME',
		'MULTI GAME':			'MULTI GAME',
	},
	ko: {
		'WELCOME TO TRANSCENDENCE':	'트랜센던스에 오신 것을 환영합니다',
		'LOCAL GAME':			'로컬 게임',
		'LOCAL 3D GAME':		'로컬 3D 게임',
		'TOURNAMENT GAME':		'토너먼트 게임',
		'MULTI GAME':			'멀티 게임',
	},
	fr: {
		'WELCOME TO TRANSCENDENCE':	'BIENVENUE À TRANSCENDENCE',
		'LOCAL GAME':			'JEU LOCAL',
		'LOCAL 3D GAME':		'JEU LOCAL 3D',
		'TOURNAMENT GAME':		'JEU DE TOURNOI',
		'MULTI GAME':			'JEU MULTI',
	},
};

// console.log(`current lan: ${currentLanguage}`);

const currentTranslations = translations[currentLanguage] || translations.en;

export const routes = [
	{
		path: '/',
		name: currentTranslations['WELCOME TO TRANSCENDENCE'],
		template: indexPage(),
	},
	{
		path: '/local',
		name: currentTranslations['LOCAL GAME'],
		template: localpvpPage(),
	},
	{
		path: '/local_3d',
		name: currentTranslations['LOCAL 3D GAME'],
		template: local3dPage(),
	},
	{
		path: '/tournament',
		name: currentTranslations['TOURNAMENT GAME'],
		template: tournamentPage(),
	},
	{
		path: '/multi',
		name: currentTranslations['MULTI GAME'],
		template: multiPage(),
	},
];
