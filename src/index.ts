import { GoogleSpreadsheet } from 'google-spreadsheet';
import chalk from 'chalk';
import 'dotenv/config';

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const creds = require('../.auth/weekly-meal-plan-creds.json');

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

function generateWeeklyMealPlan(sheet, rowsCount) {
	let meals = [];
	const toBeRolled = DAYS_OF_WEEK.reduce((mealsOfTheWeek, day) => {
		MEALS.forEach(meal => {
			mealsOfTheWeek.push(`${day} ${meal}`);
		});

		return mealsOfTheWeek;
	}, []);
	for (let rolling of toBeRolled) {
		const randomMealIndex = uniqueRandom(0, rowsCount - 1);
		const meal = sheet.getCell(randomMealIndex, 0);
		meals.push(meal.value);
		let consoleMealValue = meal.value;
		if (meal.userEnteredFormat) {
			const style = meal.userEnteredFormat.backgroundColor;
			consoleMealValue = chalk.rgb(rgbify(style.red), rgbify(style.green), rgbify(style.blue))(meal.value);
		}

		console.log(chalk.green(`${rolling}: `), `${consoleMealValue} - ${randomMealIndex + 1}`);
	}
}

(async function () {
	const doc = new GoogleSpreadsheet(process.env.GOOGLE_DOC_ID);
	await doc.useServiceAccountAuth(creds);

	await doc.loadInfo();
	const sheet = doc.sheetsByTitle['List'];
	const rows = await sheet.getRows();
	await sheet.loadCells('A1:A');
	generateWeeklyMealPlan(sheet, rows.length);
})();
