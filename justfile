# run the CI workflow locally
local-ci:
    act -W '.github/workflows/pr-check.yml' --container-architecture linux/amd64 -s GITHUB_TOKEN="$(gh auth token)"
