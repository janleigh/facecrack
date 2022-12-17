import fetch from "node-fetch";
import { Browser } from "puppeteer";

export const getRandomUserAgent = (): string => {
	const headers = [
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
		"Mozilla/5.0 (X11; Linux x86_64; rv:83.0) Gecko/20100101 Firefox/83.0",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5 (Ergänzendes Update)) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15",
	];

	return headers[Math.floor(Math.random() * headers.length)];
};

export const checkInternet = async (): Promise<boolean> => {
	const url = "https://www.google.com";
	const response = await fetch(url);
	return response.status === 200;
};

export const login = async (target: string, password: string, browser: Browser): Promise<boolean> => {
	const url = "https://www.facebook.com";

	const form = new URLSearchParams();
	form.append("email", target);
	form.append("pass", password);

	const page = await browser.newPage();
	await page.goto(url);

	// await page.screenshot({ path: `assets/facebook-${password}.png` });

	await page.setUserAgent(getRandomUserAgent());
	await page.type("#email", target);
	await page.type("#pass", password);

	await page.keyboard.press("Enter");

	await page.waitForNavigation();
	const isLoggedIn = await page.evaluate(() => {
		return !!document.querySelector(".x9f619");
	});

	return isLoggedIn;
};
