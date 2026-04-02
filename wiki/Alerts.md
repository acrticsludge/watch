# Alerts

Stackwatch has two types of alerts: **threshold alerts** and **spike detection alerts**.

## Threshold Alerts

Fires when a metric's usage percent crosses a configured percentage (default 80%).

- Configure per-metric in **Settings → Alert Thresholds**
- Set the trigger percentage with the slider (10–100%)
- Anti-spam: won't re-fire until usage drops below the threshold and crosses it again

## Spike Detection (Pro)

Fires when a metric suddenly jumps well above its recent baseline — even if the absolute percentage is low.

- Available on the **Pro plan** only
- Toggle per-metric in **Settings → Alert Thresholds → Spike Alerts**
- Uses a statistical baseline (last ~24 readings) to detect anomalies
- Cool-down: at most one spike alert per metric per hour

### How it works

Stackwatch computes the mean and standard deviation of the last 24 readings for a metric. A spike is detected when the current value is more than 2.5 standard deviations above the mean **and** at least 1.5× the typical baseline. This catches genuine anomalies (a sudden 5× memory spike) without false-positives from stable metrics with tiny natural variation.

The baseline window is approximately:
- **Free tier**: ~6 hours (15-minute polling × 24 readings)
- **Pro tier**: ~2 hours (5-minute polling × 24 readings)

At least 6 data points are required before spike detection activates for a metric.

## Notification Channels

Both alert types are delivered through the same configured channels:

| Channel | Free | Pro |
|---|---|---|
| Email | ✓ | ✓ |
| Slack | — | ✓ |
| Discord | — | ✓ |
| Browser Push | — | ✓ |

Configure channels in **Settings → Notifications**.
