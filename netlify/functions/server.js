import puppeteer from "puppeteer";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import chromium from "chrome-aws-lambda";
import "encoding";

const app = express();

const getRouteData = async () => {
	try {
		// Start a Puppeteer session
		const browser = await chromium.puppeteer.launch({
			headless: false,
			defaultViewport: null,
		});

		// Open a new page
		const page = await browser.newPage();

		// navigate to my bus site and wait for the page to load
		await page
			.goto(
				"https://mybusnow.njtransit.com/bustime/wireless/html/eta.jsp?route=190&direction=New+York&id=13498&showAllBusses=on",
				{
					waitUntil: "domcontentloaded",
				}
			)
			.then(() => {
				console.log("page loaded");
			});

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
		console.log("pulled results", results);
		// close browser and return results
		await browser.close();
		return {
			statusCode: 200,
			body: JSON.stringify(results),
		};
	} catch (e) {
		console.log(e);
		return {
			statusCode: 500,
			body: JSON.stringify(e),
		};
	}
};

app.get("/.netlify/functions/server", async (req, res) => {
	res.send(await getRouteData());
});

app.use(morgan("combined"));
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

exports.handler = serverless(app);
