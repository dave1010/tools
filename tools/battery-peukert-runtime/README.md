---
title: Peukert Battery Runtime Estimator
description: Estimate runtime using Peukert's law
category: Calculators & Planners
---

Estimate how long a battery pack will run a load when Peukert's law is significant (e.g., lead-acid or NiCd cells).

## How it works
- Enter the rated capacity, test current, Peukert exponent, and your real-world load current.
- Adjust the number of cells in series/parallel, cutoff depth of discharge, and an optional DC-DC efficiency.
- The calculator applies Peukert's law to estimate effective capacity, then converts it to runtime at your chosen cutoff.

## Tips
- Peukert exponents near 1.0 behave almost linearly (e.g., lithium-ion). Lead-acid packs often fall between 1.1–1.3, so high currents shrink runtime quickly.
- For large inverters, the DC-DC efficiency can stand in for inverter efficiency.
- Keep wiring and temperature losses in mind—real packs may deliver even less than the model predicts.
