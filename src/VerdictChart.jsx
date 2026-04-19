import { Chart, registerables } from 'chart.js';
import React, { useEffect, Suspense, useRef, use } from 'react';
import { Text, Stack, useComputedColorScheme } from '@mantine/core';
Chart.register(...registerables);

const VERDICT_COLORS = {
  YTA: '#E24B4A',
  NTA: '#639922',
  ESH: '#EF9F27',
  NAH: '#378ADD'
};


export default function VerdictChart({ postId, verdicts }) {
  const verdictData = verdicts[postId];
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const computedColorScheme = useComputedColorScheme('light');
  const dark = computedColorScheme === 'dark';
  const labelColor = dark ? '#c9c9c9' : '#000000';

  useEffect(() => {
    if (!verdictData || !chartRef.current) return;

    chartInstance.current?.destroy();

    const counts = verdictData.commentCounts;
    const labels = ['YTA', 'NTA', 'ESH', 'NAH'].filter(l => counts[l] > 0 || l === "NTA" || l === "YTA"); // Always show YTA/NTA even if 0 votes
    const values = labels.map(l => counts[l]);

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map(l => VERDICT_COLORS[l] + 'cc'),
          borderColor: labels.map(l => VERDICT_COLORS[l]),
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} votes` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: labelColor } },
          y: { beginAtZero: true, ticks: { precision: 0, color: labelColor } }
        }
      }
    });

    return () => chartInstance.current?.destroy();
  }, [postId, verdictData, labelColor]);

  if (!verdictData) return null;

  return (
    <Stack gap="xs" mt="md">
      <Text size="sm" ta="center">How Reddit voted ({verdictData.totalVerdictComments} votes)</Text>
      <div style={{ position: 'relative', width: '100%', height: '200px' }}>
        <canvas
          ref={chartRef}
          role="img"
          aria-label={`Reddit verdict breakdown for this post`}
        />
      </div>
    </Stack>
  );
}
