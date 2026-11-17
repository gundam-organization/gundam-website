#!/usr/bin/env bash
# Builds the GUNDAM code reference (Doxygen) and puts it in a folder of the
# website. Used by .github/workflows/pages.yml and for local previews.
#
# Usage: scripts/build-api-docs.sh <path to a gundam checkout> <output folder>
#   e.g. scripts/build-api-docs.sh ../gundam api      (local preview)
#        scripts/build-api-docs.sh gundam-src _site/api   (CI)
#
# The Doxygen configuration itself lives in the gundam repository
# (docs/doxygen/Doxyfile); api-docs/doxygen-site.conf only adds the website's
# look (logo, colours) and the output location. If the checkout has no
# Doxyfile yet, a placeholder page is written instead so the site still builds.
set -euo pipefail

GUNDAM_DIR=$(cd "${1:?path to a gundam checkout}" && pwd)
OUT_DIR=${2:?output folder}
SITE_DIR=$(cd "$(dirname "$0")/.." && pwd)
DOXY_DIR="$GUNDAM_DIR/docs/doxygen"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

if [ ! -f "$DOXY_DIR/Doxyfile" ]; then
  echo "No docs/doxygen/Doxyfile in $GUNDAM_DIR: writing a placeholder page." >&2
  cp "$SITE_DIR/api-docs/placeholder.html" "$OUT_DIR/index.html"
  exit 0
fi

command -v doxygen >/dev/null || { echo "doxygen is not installed" >&2; exit 1; }

# Version shown next to the project name, e.g. "1.8.6-23-g8f2ce4c".
VERSION=$(git -C "$GUNDAM_DIR" describe --tags --always 2>/dev/null || echo "unknown")
BUILD=$(mktemp -d)
trap 'rm -rf "$BUILD"' EXIT

# Doxygen reads its configuration from stdin ("-"); later lines override
# earlier ones. Relative paths in the Doxyfile resolve from docs/doxygen.
(
  cd "$DOXY_DIR"
  {
    cat Doxyfile
    sed "s#@SITE_DIR@#$SITE_DIR#g" "$SITE_DIR/api-docs/doxygen-site.conf"
    echo "PROJECT_NUMBER   = \"$VERSION\""
    echo "OUTPUT_DIRECTORY = $BUILD"
    echo "HTML_OUTPUT      = html"
    echo "WARN_LOGFILE     = $BUILD/warnings.log"
  } | doxygen -
)

cp -R "$BUILD/html/." "$OUT_DIR/"
NWARN=$(grep -c . "$BUILD/warnings.log" 2>/dev/null || true)
echo "Code reference for $VERSION written to $OUT_DIR ($(find "$OUT_DIR" -type f | wc -l) files, ${NWARN:-0} Doxygen warnings)."
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "### Code reference"
    echo "Built from \`$(git -C "$GUNDAM_DIR" remote get-url origin 2>/dev/null || echo "$GUNDAM_DIR")\` at \`$VERSION\` with ${NWARN:-0} Doxygen warnings."
  } >> "$GITHUB_STEP_SUMMARY"
fi
