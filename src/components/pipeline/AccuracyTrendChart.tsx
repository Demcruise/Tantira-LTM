import { Card, H4 } from "@blueprintjs/core";
import type { Lead } from "../../types";
import { buildAccuracyTrend } from "../../lib/insights";

const WIDTH = 640;
const HEIGHT = 200;
const PAD_LEFT = 36;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const Y_MIN = 50;
const Y_MAX = 100;

function scaleX(i: number, count: number): number {
  const usable = WIDTH - PAD_LEFT - PAD_RIGHT;
  return PAD_LEFT + (count === 1 ? usable / 2 : (usable * i) / (count - 1));
}

function scaleY(value: number): number {
  const usable = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const clamped = Math.max(Y_MIN, Math.min(Y_MAX, value));
  return PAD_TOP + usable * (1 - (clamped - Y_MIN) / (Y_MAX - Y_MIN));
}

export function AccuracyTrendChart({ leads }: { leads: Lead[] }) {
  const points = buildAccuracyTrend(leads);
  const gridValues = [50, 60, 70, 80, 90, 100];

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(i, points.length)} ${scaleY(p.accuracy)}`)
    .join(" ");

  const first = points[0].accuracy;
  const last = points[points.length - 1].accuracy;
  const delta = last - first;

  return (
    <Card elevation={1} className="accuracy-trend">
      <div className="accuracy-trend__title-row">
        <H4>Prioritization Accuracy</H4>
        <span className="accuracy-trend__delta" style={{ color: delta >= 0 ? "#238551" : "#CD4246" }}>
          {delta >= 0 ? "+" : ""}
          {delta} pts since {points[0].label}
        </span>
      </div>
      <p className="accuracy-trend__subtitle">
        Prediction accuracy (Hot → Won) as outcome logging feeds back into the scoring model.
      </p>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="accuracy-trend__svg" role="img" aria-label="Scoring accuracy trend chart">
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={scaleY(v)}
              y2={scaleY(v)}
              stroke="#eef0f3"
              strokeWidth={1}
            />
            <text x={PAD_LEFT - 8} y={scaleY(v) + 3} textAnchor="end" className="accuracy-trend__axis-label">
              {v}%
            </text>
          </g>
        ))}

        <path d={linePath} fill="none" stroke="#2D72D2" strokeWidth={2} />

        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={p.label}>
              <circle
                cx={scaleX(i, points.length)}
                cy={scaleY(p.accuracy)}
                r={isLast ? 5 : 3.5}
                fill={isLast ? "#2D72D2" : "#fff"}
                stroke="#2D72D2"
                strokeWidth={2}
              />
              {isLast && (
                <text
                  x={scaleX(i, points.length)}
                  y={scaleY(p.accuracy) - 12}
                  textAnchor="end"
                  className="accuracy-trend__value-label"
                >
                  {p.accuracy}%
                </text>
              )}
              <text
                x={scaleX(i, points.length)}
                y={HEIGHT - 8}
                textAnchor="middle"
                className="accuracy-trend__axis-label"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
}
