#!/usr/bin/env node
import { execSync } from "child_process";
import chalk from "chalk";

function execCommand(command) {
  const verbose = process.argv.includes("--verbose");

  try {
    const result = execSync(command, { shell: "/bin/sh" }).toString().trim();
    if (verbose) {
      console.log(chalk.blue(`Command: ${command}`)); // Debug: log command
      console.log(chalk.blue(`Output: ${result}`)); // Debug: log raw output
    }
    if (!result) throw new Error("No output returned.");
    return result;
  } catch (error) {
    console.error(chalk.red(`Error executing command: ${command}`));
    console.error(chalk.red(`Error message: ${error.message}`));
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

function formatDuration(startDate, endDate) {
  // Calculate the total difference in milliseconds
  const totalMillis = endDate - startDate;

  // Define the lengths of time units in milliseconds
  // Define the lengths of time units in milliseconds
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30; // Approximation of a month
  const year = day * 365; // Approximation of a year

  // Calculate the time components
  const years = Math.floor(totalMillis / year);
  const months = Math.floor((totalMillis % year) / month);
  const weeks = Math.floor((totalMillis % month) / week);
  const days = Math.floor((totalMillis % week) / day);
  const hours = Math.floor((totalMillis % day) / hour);
  const minutes = Math.floor((totalMillis % hour) / minute);
  const seconds = Math.floor((totalMillis % minute) / second);



  // Create an array of formatted time components that are non-zero
  const parts = [];
  if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (weeks) parts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  if (seconds) parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

  // Format the output by joining the parts with commas
  return parts.join(", ");
}

function getCommitDetails(commitHash) {
  // Ensure that commitHash does not contain invalid characters or multiple hashes
  if (commitHash.includes("\n")) commitHash = commitHash.split("\n")[0]; // Take only the first hash if there are multiple
  const command = `git show -s --format="%ci %h %an" ${commitHash}`;
  const output = execCommand(command);
  if (!output) {
    console.error(
      chalk.red("Failed to get commit details for hash: " + commitHash)
    );
    return null;
  }
  return output;
}

function getGitHistory() {
  // Get first commit
  const firstCommitHash = execCommand("git rev-list --max-parents=0 HEAD");
  const firstCommitDetails = getCommitDetails(firstCommitHash.trim());

  const [firstCommitDate] = firstCommitDetails.split(" ");

  // Get last commit
  const lastCommitHash = execCommand("git rev-list -n 1 HEAD");
  const lastCommitDetails = getCommitDetails(lastCommitHash.trim());
  const [lastCommitDate] = lastCommitDetails.split(" ");

  // Duration and total commits
  const startDate = new Date(firstCommitDate);
  const endDate = new Date(lastCommitDate);

  const numCommits = execCommand("git rev-list --count HEAD");
  const numBranches = execCommand("git branch | wc -l");
  const numPullRequests = execCommand(
    'git log --oneline --grep="Merge pull request" | wc -l'
  );
  const numContributors = execCommand("git log | git shortlog -sn | wc -l");

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
  console.log(chalk.green(`🚀 First Commit: ${formatDate(firstCommitDate)}`));
  console.log(chalk.yellow(`🏁 Last Commit: ${formatDate(lastCommitDate)}`));
  console.log("..............................");
  console.log(
    chalk.white(
      `⏳ Duration Between First and Last Commit: ${formatDuration(
        startDate,
        endDate
      )}`
    )
  );
  console.log("..............................");
}

getGitHistory();
