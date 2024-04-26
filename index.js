#!/usr/bin/env node

import simpleGit from "simple-git";
import moment from "moment";
import chalk from "chalk";

const git = simpleGit();

async function getGitHistory() {
  const logSummary = await git.log();
  const firstCommit = logSummary.all[logSummary.total - 1];
  const lastCommit = logSummary.latest;
  const totalCommits = logSummary.total;

  const firstDate = moment(new Date(firstCommit.date));
  const lastDate = moment(new Date(lastCommit.date));
  const durationDays = lastDate.diff(firstDate, "days");

  const contributors = await git.raw([
    "shortlog",
    "-s",
    "-n",
    "--all",
    "--no-merges",
  ]);
  const contributorList = contributors.split("\n").filter(Boolean);
  const totalContributors = contributorList.length;
  const topContributors = contributorList
    .slice(0, 5)
    .map((line) => line.trim());

  const monthlyCommits = await git.raw([
    "rev-list",
    "--count",
    '--since="1 month ago"',
  ]);

  const repoSize = await git.raw(["count-objects", "-vH"]);

  console.log(chalk.blue("Git Repository Statistics:"));
  console.log(
    chalk.green(
      `First Commit: ${firstCommit.hash} by ${
        firstCommit.author_name
      } on ${firstDate.format("MMMM Do YYYY, h:mm:ss a")}`
    )
  );
  console.log(
    chalk.green(
      `Last Commit: ${lastCommit.hash} by ${
        lastCommit.author_name
      } on ${lastDate.format("MMMM Do YYYY, h:mm:ss a")}`
    )
  );
  console.log(
    chalk.magenta(
      `Duration Between First and Last Commit: ${durationDays} days`
    )
  );
  console.log(chalk.magenta(`Total Number of Commits: ${totalCommits}`));
  console.log(
    chalk.yellow(`Total Number of Contributors: ${totalContributors}`)
  );
  console.log(
    chalk.yellow(`Top 5 Contributors: ${topContributors.join(", ")}`)
  );
  console.log(
    chalk.cyan(`Average Commits Per Month: ${monthlyCommits.trim()}`)
  );
  console.log(chalk.cyan(`Repository Size: ${repoSize.split("\n")[0]}`));
}

getGitHistory().catch(console.error);
