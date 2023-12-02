## Create .json file to use in other steps of the workflow

---

Example of the output on the .json file created:

```json
{
  "name": "step-security",
  "password": "mypass"
}
```

### How to use

You can define a json structure on the secrets of your repository:

```json
{
  "name": "step-security",
  "password": "mypass"
}
```

<sub><sup>MY_JSON (Secrets variables can be configured on repository settings > Secrets)</sup></sub>

and use in this way:

```yaml
- name: create-json
  id: create-json
  uses: step-security/create-json@v1
  with:
    name: "credentials.json"
    json: ${{ secrets.MY_JSON }}
```

Or just declare a string of a json on the property `json` like:

```yaml
- name: create-json
  id: create-json
  uses: step-security/create-json@v1
  with:
    name: "new-json-file.json"
    json: '{"name":"step-security", "password":"mypass"}'
```

<sub><sup>The json have to be inside a string.</sup></sub>

You also can save the json on a subdirectory using the property `dir`:

```yaml
- name: create-json
  id: create-json
  uses: step-security/create-json@v1
  with:
    name: "credentials.json"
    json: ${{ secrets.CREDENTIALS_JSON }}
    dir: "src/"
```

Remember that when you create a .json file, the file was not commited, you have to commit the file if you will use the `HEAD` branch with the file to push the repository to other service, like deploy to heroku or other platforms.

If you want to create more than one json files, you have to specify different IDs for the action like:

```yaml
- name: create-json
  id: create-json-1 # First ID
  uses: step-security/create-json@v1
  with:
    name: "credentials.json"
    json: ${{ secrets.CREDENTIALS_JSON }}
    dir: "src/"
- name: create-json
  id: create-json-2 # Second ID
  uses: step-security/create-json@v1
  with:
    name: "other.json"
    json: '{"name":"step-security", "password":"mypass"}'
    dir: "src/"
```

### Real Example (Creating and Using on Other Steps)

```yaml
name: Heroku CI - CD

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: actions/setup-go@v1
        with:
          go-version: "1.14.6"
      - run: cd src && go mod vendor
      - name: create-json
        id: create-json
        uses: step-security/create-json@v1
        with:
          name: "devdatatools-firebase-adminsdk.json"
          json: ${{ secrets.CREDENTIALS_JSON }}
          dir: "src/"
      - run: git config --global user.email "email@outlook.com" && git config --global user.name "step-security" && git add . && git add --force src/devdatatools-firebase-adminsdk.json && git status && git commit -a -m "Deploy Heroku Commit with the Credentials JSON created!"
      - uses: akhileshns/heroku-deploy@v3.4.6
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "dev-data-tools-api-golang"
          heroku_email: "email@outlook.com"
          appdir: "src"
```

After commit and use with Heroku the file is deleted after the workflow and the JSON is not showed on the log, perfect for public repositories.
