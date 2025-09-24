const core = require("@actions/core");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

(async () => {
  const fileName = core.getInput("name");
  const jsonString = core.getInput("json");
  const dir = core.getInput("dir");
  const fullPath = path.join(process.env.GITHUB_WORKSPACE, dir || "", fileName);

  let fileContent = JSON.stringify(jsonString);

  fileContent = JSON.parse(fileContent);

  try {
    await validateSubscription();

    core.info("Creating json file...");
    fs.writeFile(fullPath, fileContent, function (error) {
      if (error) {
        core.setFailed(error.message);
        throw error;
      }

      core.info("JSON file created.");

      fs.readFile(fullPath, null, handleFile);

      function handleFile(err, data) {
        if (err) {
          core.setFailed(error.message);
          throw err;
        }

        core.info("JSON checked.");
        core.setOutput(
          "successfully",
          `Successfully created json on ${fullPath} directory with ${fileContent} data`
        );
      }
    });
  } catch (err) {
    core.setFailed(err.message);
  }
})();

async function validateSubscription() {
  const API_URL = `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/subscription`;

  try {
    await axios.get(API_URL, { timeout: 3000 });
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.error(
        "Subscription is not valid. Reach out to support@stepsecurity.io"
      );
      process.exit(1);
    } else {
      core.info("Timeout or API not reachable. Continuing to next step.");
    }
  }
}
