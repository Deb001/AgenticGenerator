"""Calculator package.

Provides arithmetic expression evaluation utilities and package‑level metadata.
"""

from importlib import metadata

# Package version – falls back to a development placeholder if the distribution
# metadata is unavailable (e.g., when running from source).
try:
    __version__: str = metadata.version(__name__)  # type: ignore[arg-type]
except metadata.PackageNotFoundError:  # pragma: no cover
    __version__ = "0.0.0"

# Re‑export the public API of the package for convenient imports.
from .evaluator import EvaluationError, evaluate_expression

__all__ = [
    "evaluate_expression",
    "EvaluationError",
    "__version__",
]