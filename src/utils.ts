import chalk from "chalk";
import fetch from "node-fetch";
import { Browser } from "puppeteer";

export const boldText = (str: string): string => {
	return chalk.bold(str);
};

export const getRandomUserAgent = (): string => {
	const headers = [
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
		"Mozilla/5.0 (Windows NT 10.0; rv:100.0) Gecko/20100101 Firefox/100.0",
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5028.0 Safari/537.36 OPR/89.0.4415.0 (Edition developer)",
		"Mozilla/5.0 (X11; Linux x86_64; rv:83.0) Gecko/20100101 Firefox/83.0",
		"Mozilla/5.0 (X11; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0"
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
	const page = await browser.newPage();

	await page.goto(url);

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
