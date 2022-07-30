let previousValues = [];
export default function uniqueRandom(minimum, maximum) {
	const number = Math.floor(
		(Math.random() * (maximum - minimum + 1)) + minimum
	);

	if (previousValues.indexOf(number) >= 0 && minimum !== maximum) {
		return uniqueRandom(minimum, maximum);
	}

	previousValues.push(number);
	return number;
};
