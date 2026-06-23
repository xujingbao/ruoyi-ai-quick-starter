#!/usr/bin/env bash
# Create Gitee and/or GitHub releases from CHANGELOG.md for a given version.
# Usage: create-release.sh <version>   (e.g. 5.3.0 or v5.3.0)
set -euo pipefail

REPO_OWNER="xujingbao"
REPO_NAME="ruoyi-ai-quick-starter"
GITEE_API="https://gitee.com/api/v5/repos/${REPO_OWNER}/${REPO_NAME}"
GITHUB_REPO="${REPO_OWNER}/${REPO_NAME}"

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

raw="${1:-}"
if [[ -z "$raw" ]]; then
  echo "Usage: $0 <version>   (e.g. 5.3.0)" >&2
  exit 1
fi

VERSION="${raw#v}"
TAG="v${VERSION}"
CHANGELOG="${ROOT}/CHANGELOG.md"

if [[ ! -f "$CHANGELOG" ]]; then
  echo "ERROR: CHANGELOG.md not found at $CHANGELOG" >&2
  exit 1
fi

if ! git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "ERROR: tag $TAG does not exist locally. Push the tag first." >&2
  exit 1
fi

extract_changelog_section() {
  local file="$1" ver="$2"
  awk -v ver="$ver" '
    $0 ~ "^## \\[" ver "\\]" { found=1 }
    found { print }
    found && /^---$/ { exit }
  ' "$file"
}

BODY="$(extract_changelog_section "$CHANGELOG" "$VERSION")"
if [[ -z "$BODY" ]]; then
  echo "ERROR: no CHANGELOG section for [$VERSION] in $CHANGELOG" >&2
  exit 1
fi

# Title: **标题:** line or fallback
TITLE_LINE="$(echo "$BODY" | grep -m1 '^\*\*标题:\*\*' || true)"
if [[ -n "$TITLE_LINE" ]]; then
  TITLE="${TAG} - ${TITLE_LINE#**标题:** }"
else
  TITLE="${TAG}"
fi

NOTES_FILE="$(mktemp)"
trap 'rm -f "$NOTES_FILE"' EXIT
printf '%s\n' "$BODY" > "$NOTES_FILE"

GITEE_OK=0
GITHUB_OK=0
GITEE_SKIP=0
GITHUB_SKIP=0

create_gitee_release() {
  if [[ -z "${GITEE_TOKEN:-}" ]]; then
    echo "SKIP Gitee: GITEE_TOKEN not set"
    return 0
  fi

  local existing
  existing="$(curl -fsS "https://gitee.com/api/v5/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${TAG}?access_token=${GITEE_TOKEN}" 2>/dev/null || true)"
  if echo "$existing" | grep -q '"id"'; then
    echo "SKIP Gitee: release for $TAG already exists"
    GITEE_SKIP=1
    return 0
  fi

  local payload
  payload="$(jq -n \
    --arg tag "$TAG" \
    --arg name "$TITLE" \
    --arg body "$BODY" \
    --arg target "main" \
    '{tag_name: $tag, name: $name, body: $body, target_commitish: $target, prerelease: false}')"

  local resp http_code
  resp="$(curl -sS -w "\n%{http_code}" -X POST \
    "${GITEE_API}/releases?access_token=${GITEE_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$payload")"
  http_code="${resp##*$'\n'}"
  resp="${resp%$'\n'*}"

  if [[ "$http_code" =~ ^2 ]]; then
    echo "OK Gitee: release created for $TAG"
    echo "     https://gitee.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${TAG}"
    GITEE_OK=1
  else
    echo "FAIL Gitee ($http_code): $resp" >&2
    return 1
  fi
}

create_github_release() {
  if ! command -v gh >/dev/null 2>&1; then
    echo "SKIP GitHub: gh CLI not installed"
    return 0
  fi

  if [[ -z "${GH_TOKEN:-}" ]] && ! gh auth status >/dev/null 2>&1; then
    echo "SKIP GitHub: run 'gh auth login' or set GH_TOKEN"
    return 0
  fi

  if gh release view "$TAG" --repo "$GITHUB_REPO" >/dev/null 2>&1; then
    echo "SKIP GitHub: release for $TAG already exists"
    GITHUB_SKIP=1
    return 0
  fi

  if gh release create "$TAG" \
    --repo "$GITHUB_REPO" \
    --title "$TITLE" \
    --notes-file "$NOTES_FILE"; then
    echo "OK GitHub: release created for $TAG"
    echo "     https://github.com/${GITHUB_REPO}/releases/tag/${TAG}"
    GITHUB_OK=1
  else
    echo "FAIL GitHub: gh release create failed" >&2
    return 1
  fi
}

echo "Creating releases for $TAG ..."
echo ""

create_gitee_release || true
echo ""
create_github_release || true
echo ""

if [[ $GITEE_OK -eq 0 && $GITHUB_OK -eq 0 && $GITEE_SKIP -eq 0 && $GITHUB_SKIP -eq 0 ]]; then
  echo "No releases created. Configure credentials:" >&2
  echo "  export GITEE_TOKEN=<gitee personal access token>" >&2
  echo "  gh auth login   # or export GH_TOKEN=<github token>" >&2
  echo "" >&2
  echo "Manual links:" >&2
  echo "  Gitee:  https://gitee.com/${REPO_OWNER}/${REPO_NAME}/releases/new?tag=${TAG}" >&2
  echo "  GitHub: https://github.com/${GITHUB_REPO}/releases/new?tag=${TAG}" >&2
  exit 1
fi

echo "Done."
