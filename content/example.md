---
date: 2026-09-11
title: Why averaging reduces noise
description: A concise mathematical example with a collapsible derivation, table, figure, and cross-reference.
---

Suppose independent measurements have the same mean $\mu$ and variance $\sigma^2$. Averaging more measurements preserves the mean while reducing uncertainty.

The standard deviation of the average falls as $1/\sqrt n$: four independent measurements halve it; sixteen reduce it to a quarter.

````{dropdown} Derivation and numerical reference
## The calculation

For $\bar X_n = (X_1+\cdots+X_n)/n$, independence gives

```{math}
:label: mean-variance
\operatorname{Var}(\bar X_n)
= \frac{1}{n^2}\sum_{i=1}^{n}\operatorname{Var}(X_i)
= \frac{\sigma^2}{n}.
```

Equation [](#mean-variance) means the standard deviation decreases as $1/\sqrt n$.

| Measurements | Standard deviation relative to one measurement |
| --- | --- |
| 1 | 1 |
| 4 | 1/2 |
| 16 | 1/4 |

````

```{figure} assets/averaging.svg
:label: averaging-figure
:alt: The standard deviation halves when the number of independent measurements grows from one to four, and halves again at sixteen.

More independent measurements produce a more precise average.
```

```{note}
Independence matters. Correlated errors can prevent averaging from reducing noise at this rate.
```

## References

The variance calculation is derived above. This example uses [MyST mathematical notation](https://mystmd.org/guide/math) and [cross-references](https://mystmd.org/guide/cross-references).
