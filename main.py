#!/usr/bin/env python3
"""
main.py

Main application entry point for the project. This script provides a
command‑line interface to build, serve, and test the Node.js + React
application. It uses configuration values defined in :mod:`config` and
offers robust logging and error handling.

The script is intentionally lightweight and can be extended with
additional commands or integrated into CI/CD pipelines.

Author: AI-1
"""

import argparse
import logging
import os
import subprocess
import sys
from pathlib import Path
from typing import List, Optional

# Import configuration constants from config.py
try:
    import config
except ImportError as exc:
    raise ImportError(
        "Failed to import configuration module 'config.py'. "
        "Ensure it exists in the same directory as this script."
    ) from exc

# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #

LOG_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Helper functions
# --------------------------------------------------------------------------- #

def run_command(
    command: List[str],
    cwd: Optional[Path] = None,
    env: Optional[dict] = None,
) -> int:
    """
    Execute a shell command and stream its output to the logger.

    Parameters
    ----------
    command : List[str]
        The command and its arguments to execute.
    cwd : Optional[Path]
        Working directory for the command. Defaults to the current
        directory.
    env : Optional[dict]
        Environment variables for the subprocess. If None, the current
        environment is used.

    Returns
    -------
    int
        The return code of the subprocess.
    """
    logger.debug("Running command: %s", " ".join(command))
    try:
        process = subprocess.Popen(
            command,
            cwd=cwd,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        assert process.stdout is not None  # for type checker
        for line in process.stdout:
            logger.info(line.rstrip())
        return_code = process.wait()
        if return_code != 0:
            logger.error("Command failed with exit code %s", return_code)
        return return_code
    except FileNotFoundError as exc:
        logger.exception("Command not found: %s", command[0])
        return 127
    except Exception as exc:
        logger.exception("Unexpected error while running command: %s", command)
        return 1

def validate_project_root() -> Path:
    """
    Ensure the script is executed from the project root.

    Returns
    -------
    Path
        Path to the project root directory.

    Raises
    ------
    RuntimeError
        If the expected package.json file is not found.
    """
    root = Path.cwd()
    package_json = root / "package.json"
    if not package_json.is_file():
        raise RuntimeError(
            f"package.json not found in {root}. "
            "Please run this script from the project root."
        )
    return root

# --------------------------------------------------------------------------- #
# Command implementations
# --------------------------------------------------------------------------- #

def build() -> None:
    """
    Build the React application using the command defined in config.
    """
    root = validate_project_root()
    logger.info("Starting build process...")
    ret = run_command(config.BUILD_COMMAND.split(), cwd=root)
    if ret != 0:
        logger.error("Build failed.")
        sys.exit(ret)
    logger.info("Build completed successfully.")

def serve() -> None:
    """
    Serve the React application locally using the command defined in config.
    """
    root = validate_project_root()
    logger.info("Starting development server...")
    ret = run_command(config.SERVE_COMMAND.split(), cwd=root)
    if ret != 0:
        logger.error("Server exited with errors.")
        sys.exit(ret)

def test() -> None:
    """
    Run the test suite using the command defined in config.
    """
    root = validate_project_root()
    logger.info("Running tests...")
    ret = run_command(config.TEST_COMMAND.split(), cwd=root)
    if ret != 0:
        logger.error("Tests failed.")
        sys.exit(ret)
    logger.info("All tests passed successfully.")

# --------------------------------------------------------------------------- #
# CLI entry point
# --------------------------------------------------------------------------- #

def main() -> None:
    """
    Parse command‑line arguments and dispatch to the appropriate command.
    """
    parser = argparse.ArgumentParser(
        description="Project management CLI for the React calculator app."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("build", help="Build the production bundle.")
    subparsers.add_parser("serve", help="Start the development server.")
    subparsers.add_parser("test", help="Run the test suite.")

    args = parser.parse_args()

    try:
        if args.command == "build":
            build()
        elif args.command == "serve":
            serve()
        elif args.command == "test":
            test()
        else:
            parser.error(f"Unknown command: {args.command}")
    except Exception as exc:
        logger.exception("Unhandled exception: %s", exc)
        sys.exit(1)

if __name__ == "__main__":
    main()