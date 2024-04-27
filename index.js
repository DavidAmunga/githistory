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
  const durationDays = Math.round((endDate - startDate) / (1000 * 3600 * 24));

  const numCommits = execCommand("git rev-list --count HEAD");
  const numBranches = execCommand("git branch | wc -l");
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
  console.log(chalk.green(`🚀 First Commit: ${formatDate(firstCommitDate)}`));
  console.log(chalk.yellow(`🏁 Last Commit: ${formatDate(lastCommitDate)}`));
  console.log("..............................");
  console.log(
    chalk.white(
      `⏳ Duration Between First and Last Commit: ${durationDays} days`
    )
  );
  console.log("..............................");
}

getGitHistory();
