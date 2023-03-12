import puppeteer from "puppeteer";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import serverless from "serverless-http";
import "encoding";

const app = express();
app.use(morgan("combined"));
app.use(helmet());
app.use(cors());

const getRouteData = async () => {
	// Start a Puppeteer session
	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport: null,
	});

	// Open a new page
	const page = await browser.newPage();

	// navigate to my bus site and wait for the page to load
	await page.goto(
		"https://mybusnow.njtransit.com/bustime/wireless/html/eta.jsp?route=190&direction=New+York&id=13498&showAllBusses=on",
		{
			waitUntil: "domcontentloaded",
		}
	);

	// Get page data
	const results = await page.evaluate(() => {
		// my bus site stores all information we need in <strong> elements
		const strongEle = document.querySelectorAll(".larger");

		// make an array from stringEle
		const strongEleArray = Array.from(strongEle);

		// put every two elements into a new object and return the array
		const data = strongEleArray.reduce((acc, curr, index) => {
			if (index % 2 === 0) {
				acc.push({
					busNumber: curr.innerText,
					eta: strongEleArray[index + 1].innerText,
				});
			}
			return acc;
		}, []);
		const updatedDate = new Date();
		return {
			updatedDate,
			data,
		};
	});

	// close browser and return results
	await browser.close();
	return results;
};

app.get("/", async (req, res) => {
	res.send(await getRouteData());
});

app.listen(3001, () => {
	console.log("listening on port 3001");
});

const lambda = serverless(app);

export async function handler(event, context) {
	return lambda(event, context);
}
