#!/usr/bin/env node

const simpleGit = require("simple-git");
const git = simpleGit();

async function getGitStats() {
  const logSummary = await git.log();
  const firstCommit = logSummary.all[logSummary.total - 1];
  const lastCommit = logSummary.latest;

  const firstDate = new Date(firstCommit.date);
  const lastDate = new Date(lastCommit.date);
  const durationMs = lastDate - firstDate;
  const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));

  console.log(
    `First Commit: ${firstCommit.hash} - ${firstCommit.author_name}, ${firstCommit.date}`
  );
  console.log(
    `Last Commit: ${lastCommit.hash} - ${lastCommit.author_name}, ${lastCommit.date}`
  );
  console.log(`Duration Between First and Last Commit: ${durationDays} days`);
  console.log(`Total Number of Commits: ${logSummary.total}`);
}

getGitStats().catch(console.error);
