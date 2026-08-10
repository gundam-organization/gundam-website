#!/usr/bin/env python3
"""Small dependency-free development server used by local preview tooling."""

from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--strictPort", action="store_true")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    handler = partial(SimpleHTTPRequestHandler, directory=root)
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"Serving GUNDAM website at http://{args.host}:{args.port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()

