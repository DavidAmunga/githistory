#!/usr/bin/env node

import simpleGit from "simple-git";
import path from "path";
import { execSync } from "child_process";
import chalk from "chalk";

function execCommand(command) {
  try {
    return execSync(command).toString().trim();
  } catch (error) {
    console.error(chalk.red("Error executing command:"), command);
    return null;
  }
}

function getRepositoryName() {
  const remoteUrl = execCommand("git config --get remote.origin.url");
  if (!remoteUrl) {
    console.error(chalk.red('No remote named "origin" found.'));
    return "unknown"; // Return a default or indicate unknown.
  }

  // This regular expression is designed to capture the repository name
  // from typical Git URLs (both SSH and HTTPS formats).
  const repoNameMatch = remoteUrl.match(/\/([^\/]+?)(\.git)?$/);
  if (repoNameMatch) {
    return repoNameMatch[1]; // The repository name without .git
  } else {
    console.error(chalk.red("Failed to parse repository name."));
    return "unknown"; // Return a default or indicate unknown.
  }
}
// Function to format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getGitHistory() {
  // Get first commit
  const firstCommitHash = execCommand("git rev-list --max-parents=0 HEAD");
  const firstCommitDetails = execCommand(
    `git show -s --format="%ci %h %an" ${firstCommitHash}`
  );
  const [firstCommitDate] = firstCommitDetails.split(" ");

  // Get last commit
  const lastCommitDetails = execCommand('git log -1 --format="%ci %h %an"');
  const [lastCommitDate] = lastCommitDetails.split(" ");

  // Duration and total commits
  const startDate = new Date(firstCommitDate);
  const endDate = new Date(lastCommitDate);
  const durationDays = Math.round((endDate - startDate) / (1000 * 3600 * 24));

  const numCommits = execCommand("git rev-list --count HEAD");
  const numBranches = execCommand("git branch | wc -l");
  const topContributors = execCommand("git shortlog -sn -e | head -5");
  const numPullRequests = execCommand(
    'git log --oneline --grep="Merge pull request" | wc -l'
  );
  const numContributors = execCommand("git shortlog -sn | wc -l");

  // Display formatted results

  console.log(
    chalk.yellow.bold.underline(
      `\n🔢 Repository History for: ${getRepositoryName()}!\n`
    )
  );
  console.log("..............................");
  console.log(chalk.white(`🔢 Total Number of Commits: ${numCommits}`));
  console.log(
    chalk.white(`📩 Total Number of Pull Requests : ${numPullRequests}`)
  );
  console.log(chalk.white(`🌿 Total Number of Branches: ${numBranches}`));
  console.log(
    chalk.white(`👥 Total Number of Contributors: ${numContributors}`)
  );

  console.log("..............................");
  console.log(chalk.white(`🚀 First Commit: ${formatDate(firstCommitDate)}`));
  console.log(chalk.white(`🏁 Last Commit: ${formatDate(lastCommitDate)}`));
  console.log("..............................");
  console.log(
    chalk.white(
      `⏳ Duration Between First and Last Commit: ${durationDays} days`
    )
  );
  if (topContributors.length > 0) {
    console.log("..............................");
    console.log(chalk.white("🏆 Top 5 Contributors 🏆"));
    console.log(chalk.white(topContributors));
    console.log("..............................");
  }
}

getGitHistory();
