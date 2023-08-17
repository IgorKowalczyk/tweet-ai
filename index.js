import chalk from "chalk";
import OpenAI from "openai";
import ora from "ora";
import prompts from "prompts";
import "dotenv/config";

if (!process.env.OPENAI_ORG) {
 throw new Error("OPENAI_ORG is not defined");
}
if (!process.env.OPENAI_KEY) {
 throw new Error("OPENAI_KEY is not defined");
}

const openai = new OpenAI({
 organization: process.env.OPENAI_ORG,
 apiKey: process.env.OPENAI_KEY,
});

const generate = async () => {
 try {
  const answer = await prompts({
   type: "text",
   name: "tweet",
   message: "What do you want to tweet?",
   validate: (value) => {
    if (value.length < 5) {
     return "The tweet must be at least 5 characters long";
    } else if (value.length > 100) {
     return "The tweet must be less than 100 characters long";
    } else {
     return true;
    }
   },
  });

  const spinner = ora("Generating tweet...").start();
  const prompt = `Tweet ${answer.tweet}`;

  const response = await openai.completions.create({
   model: "text-davinci-003",
   prompt: prompt.toString(),
   temperature: 0,
   /* eslint-disable no-return-assign, camelcase */
   max_tokens: 60,
   top_p: 1,
   frequency_penalty: 0,
   presence_penalty: 0,
   /* eslint-enable no-return-assign, camelcase */
  });

  spinner.stop();

  console.log(chalk.green.bold("🐦") + chalk.bold(" Generated tweet: ") + response.choices[0].text.trim() + "\n");

  const rerun = await prompts({
   type: "confirm",
   name: "value",
   message: "Do you want to generate another tweet?",
   initial: true,
  });

  if (rerun.value) {
   return generate();
  } else {
   console.log(chalk.green.bold("👋") + chalk.bold(" Bye!"));
  }
 } catch (error) {
  console.log(chalk.red.bold("\n✖") + chalk.bold(" Error: ") + error);
  process.exit(1);
 }
};

generate();
