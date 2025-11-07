---
title: JS PyTorch Linear Fit Lab
description: Train a tiny regression demo.
category: Developer
---

This playground shows how js-pytorch can fit a simple linear function directly in the browser.

1. Adjust the synthetic data settings — slope, intercept, noise and number of samples.
2. Generate the dataset, then click **Train model** to watch the loss fall over a handful of epochs.
3. Compare the learned weights with the ground-truth values and inspect the predicted line overlayed on the scatter plot.

The fitting loop is implemented with `torch.nn.Linear`, `torch.nn.MSELoss`, and the `torch.optim.Adam` optimizer to mimic a tiny PyTorch training script.
