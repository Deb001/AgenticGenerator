from typing import List


def fibonacci(n: int) -> List[int]:
    """
    Return a list containing the first `n` Fibonacci numbers.

    - If n <= 0, returns an empty list.
    - If n == 1, returns [0].
    - For n >= 2, returns a list starting with [0, 1] followed by the
      remaining numbers generated iteratively.

    Parameters
    ----------
    n : int
        The number of Fibonacci numbers to generate.

    Returns
    -------
    List[int]
        List of the first `n` Fibonacci numbers.
    """
    if n <= 0:
        return []
    if n == 1:
        return [0]

    result: List[int] = [0, 1]
    for _ in range(2, n):
        result.append(result[-1] + result[-2])
    return result


if __name__ == "__main__":
    fib_sequence = fibonacci(20)

    # Basic sanity checks
    assert len(fib_sequence) == 20, "Expected 20 Fibonacci numbers"
    assert fib_sequence[:5] == [0, 1, 1, 2, 3], "First five numbers mismatch"

    # Output the sequence
    print(", ".join(str(num) for num in fib_sequence))