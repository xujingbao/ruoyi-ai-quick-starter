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

# Auto-load local credentials if present (never commit this file)
if [[ -f "${ROOT}/.env.release.local" ]]; then
  # shellcheck disable=SC1091
  set -a && source "${ROOT}/.env.release.local" && set +a
fi

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

redact() {
  local text="$1"
  if [[ -n "${GITEE_TOKEN:-}" ]]; then
    text="${text//${GITEE_TOKEN}/[REDACTED]}"
  fi
  if [[ -n "${GH_TOKEN:-}" ]]; then
    text="${text//${GH_TOKEN}/[REDACTED]}"
  fi
  printf '%s' "$text"
}

is_json() {
  local body="$1"
  [[ "$body" =~ ^[[:space:]]*[\{\[] ]]
}

is_gitee_maintenance() {
  local body="$1"
  echo "$body" | grep -qiE '系统升级|Gitee 系统升级|maintenance|即将为您提供更好的服务'
}

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

TITLE_LINE="$(echo "$BODY" | grep -m1 '^\*\*标题:\*\*' || true)"
if [[ -n "$TITLE_LINE" ]]; then
  TITLE="${TAG} - ${TITLE_LINE#**标题:** }"
else
  TITLE="${TAG}"
fi

NOTES_FILE="$(mktemp)"
BODY_FILE="$(mktemp)"
trap 'rm -f "$NOTES_FILE" "$BODY_FILE"' EXIT
printf '%s\n' "$BODY" > "$NOTES_FILE"

GITEE_OK=0
GITHUB_OK=0
GITEE_SKIP=0
GITHUB_SKIP=0
GITEE_DEFER=0

# curl GET with maintenance retries. Sets GITEE_HTTP_BODY / GITEE_HTTP_CODE.
gitee_http_get() {
  local url="$1"
  local delay=4 i code
  GITEE_HTTP_BODY=""
  GITEE_HTTP_CODE="000"
  for i in 1 2 3 4; do
    code="$(curl -sS -o "$BODY_FILE" -w "%{http_code}" "$url" 2>/dev/null || echo "000")"
    GITEE_HTTP_BODY="$(cat "$BODY_FILE" 2>/dev/null || true)"
    GITEE_HTTP_CODE="$code"
    if is_gitee_maintenance "$GITEE_HTTP_BODY"; then
      echo "WARN Gitee: maintenance page (attempt $i/4), retry in ${delay}s..." >&2
      sleep "$delay"
      delay=$((delay * 2))
      continue
    fi
    return 0
  done
  return 1
}

create_gitee_release() {
  if [[ -z "${GITEE_TOKEN:-}" ]]; then
    echo "SKIP Gitee: GITEE_TOKEN not set"
    return 0
  fi

  if ! gitee_http_get "${GITEE_API}/releases/tags/${TAG}?access_token=${GITEE_TOKEN}"; then
    if is_gitee_maintenance "$GITEE_HTTP_BODY"; then
      echo "DEFER Gitee: still under maintenance after retries"
      echo "     Re-run later: .cursor/skills/ruoyi-release/scripts/create-release.sh ${VERSION}"
      GITEE_DEFER=1
      return 0
    fi
  fi

  if is_gitee_maintenance "$GITEE_HTTP_BODY"; then
    echo "DEFER Gitee: still under maintenance after retries"
    echo "     Re-run later: .cursor/skills/ruoyi-release/scripts/create-release.sh ${VERSION}"
    GITEE_DEFER=1
    return 0
  fi

  # Only treat as existing when response is JSON with a numeric id (avoid HTML false positives)
  if is_json "$GITEE_HTTP_BODY" && echo "$GITEE_HTTP_BODY" | grep -qE '"id"[[:space:]]*:[[:space:]]*[0-9]+'; then
    echo "SKIP Gitee: release for $TAG already exists"
    echo "     https://gitee.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${TAG}"
    GITEE_SKIP=1
    return 0
  fi

  local payload delay=4 i code
  payload="$(jq -n \
    --arg tag "$TAG" \
    --arg name "$TITLE" \
    --arg body "$BODY" \
    --arg target "main" \
    '{tag_name: $tag, name: $name, body: $body, target_commitish: $target, prerelease: false}')"

  for i in 1 2 3 4; do
    code="$(curl -sS -o "$BODY_FILE" -w "%{http_code}" -X POST \
      "${GITEE_API}/releases?access_token=${GITEE_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$payload" 2>/dev/null || echo "000")"
    GITEE_HTTP_BODY="$(cat "$BODY_FILE" 2>/dev/null || true)"
    GITEE_HTTP_CODE="$code"

    if is_gitee_maintenance "$GITEE_HTTP_BODY"; then
      echo "WARN Gitee: maintenance on POST (attempt $i/4), retry in ${delay}s..." >&2
      sleep "$delay"
      delay=$((delay * 2))
      continue
    fi
    break
  done

  if [[ "$GITEE_HTTP_CODE" =~ ^2 ]]; then
    echo "OK Gitee: release created for $TAG"
    echo "     https://gitee.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${TAG}"
    GITEE_OK=1
  elif is_gitee_maintenance "$GITEE_HTTP_BODY"; then
    echo "DEFER Gitee: still under maintenance after POST retries"
    echo "     Re-run later: .cursor/skills/ruoyi-release/scripts/create-release.sh ${VERSION}"
    GITEE_DEFER=1
  else
    echo "FAIL Gitee ($GITEE_HTTP_CODE): $(redact "$GITEE_HTTP_BODY")" >&2
    return 1
  fi
}

create_github_release() {
  if ! command -v gh >/dev/null 2>&1; then
    echo "SKIP GitHub: gh CLI not installed"
    return 0
  fi

  if [[ -z "${GH_TOKEN:-}" ]] && ! gh auth status >/dev/null 2>&1; then
    echo "SKIP GitHub: set GH_TOKEN in .env.release.local or run 'gh auth login'"
    echo "     Path: GitHub → Settings → Developer settings → Personal access tokens"
    echo "     Classic: repo scope; Fine-grained: Contents Read and write on this repo"
    return 0
  fi

  if gh release view "$TAG" --repo "$GITHUB_REPO" >/dev/null 2>&1; then
    echo "SKIP GitHub: release for $TAG already exists"
    echo "     https://github.com/${GITHUB_REPO}/releases/tag/${TAG}"
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
  if [[ $GITEE_DEFER -eq 1 ]]; then
    echo "No releases created yet (Gitee deferred)." >&2
  else
    echo "No releases created. Configure credentials in .env.release.local:" >&2
    echo "  export GITEE_TOKEN=<gitee personal access token>" >&2
    echo "  export GH_TOKEN=<github token>" >&2
    echo "  # or: gh auth login" >&2
  fi
  echo "" >&2
  echo "Manual links:" >&2
  echo "  Gitee:  https://gitee.com/${REPO_OWNER}/${REPO_NAME}/releases/new?tag=${TAG}" >&2
  echo "  GitHub: https://github.com/${GITHUB_REPO}/releases/new?tag=${TAG}" >&2
  exit 1
fi

if [[ $GITEE_DEFER -eq 1 ]]; then
  echo "Done (partial). Re-run create-release.sh when Gitee is healthy to finish Gitee Release."
else
  echo "Done."
fi
