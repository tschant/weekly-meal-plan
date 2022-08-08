import { GoogleSpreadsheet } from 'google-spreadsheet';
import chalk from 'chalk';
import meow from 'meow';
import 'dotenv/config';
import uniqueRandom from './helpers/unique-random-number.js';

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const creds = require('./.auth/weekly-meal-plan-creds.json');

const DAYS_OF_WEEK = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
];
const MEALS = [
	'Lunch',
	'Dinner'
];

function rgbify(perc) {
	return Math.floor(perc * 255);
}

/*
TODO:
* Add skip for certain days
* Interface or send an email of generated list 
*/
function makeFullWeekMealPlan(sheet, rowsCount) {
	let meals = [];
	const toBeRolled = DAYS_OF_WEEK.reduce((mealsOfTheWeek, day) => {
		MEALS.forEach(meal => {
			mealsOfTheWeek.push(`${day} ${meal}`);
		});

		return mealsOfTheWeek;
	}, []);
	for (let rolling of toBeRolled) {
		meals.push(rollJustOne(rolling, sheet, rowsCount));
	}
}

function rollJustOne(rolling, sheet, rowsCount) {
	const randomMealIndex = uniqueRandom(0, rowsCount - 1);
	const meal = sheet.getCell(randomMealIndex, 0);
	let consoleMealValue = meal.value;
	if (meal.userEnteredFormat) {
		const style = meal.userEnteredFormat.backgroundColor;
		consoleMealValue = chalk.rgb(rgbify(style.red), rgbify(style.green), rgbify(style.blue))(meal.value);
	}

	console.log(chalk.red(`${rolling}: `), `${consoleMealValue} - ${randomMealIndex + 1}`);
	return meal;
}

async function startTheRolling(rollFullWeek, count) {
	const doc = new GoogleSpreadsheet(process.env.GOOGLE_DOC_ID);
	await doc.useServiceAccountAuth(creds);

	await doc.loadInfo();
	const sheet = doc.sheetsByTitle['List'];
	const rows = await sheet.getRows();
	await sheet.loadCells('A1:A');

	if (rollFullWeek) {
		makeFullWeekMealPlan(sheet, rows.length);
	} else if (count && count > 1) {
		for (let i = 0; i < count; i++) {
			rollJustOne(`Random Meal ${i + 1}`, sheet, rows.length);
		}
	} else {
		rollJustOne('Random Meal', sheet, rows.length);
	}
}

const {flags} = meow(`
${chalk.red.bold('Usage')}
$ node ./index.js

${chalk.red.bold('Options')}
--week, -w	Roll for every day
--count, -c	How many days to roll for

${chalk.red.bold('Examples')}
$ node ./index.js --week
$ node ./index.js -c 4
`, {
		importMeta: import.meta,
		flags: {
			week: {
				type: 'boolean',
				alias: 'w'
			},
			count: {
				type: 'number',
				alias: 'c'
			}
		}
	});

startTheRolling(flags.week, flags.count);
