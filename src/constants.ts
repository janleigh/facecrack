import chalk from "chalk";

export const redAst = `[${chalk.red("*")}] `,
	yellow = `[ ${chalk.yellow("INFO")} ] `,
	red = `[ ${chalk.red("FAIL")} ] `,
	green = `[ ${chalk.green("PASS")} ] `,
	warn = `[ ${chalk.bold(chalk.yellow("WARN"))} ] `,
	pwned = `[ ${chalk.green("PWNED")} ] `;
