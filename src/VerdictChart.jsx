import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import React, { useEffect, Suspense, useRef } from 'react';
import { Alert, Text, Stack, useComputedColorScheme, Tooltip, Group } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
Chart.register(...registerables);
Chart.register(ChartDataLabels);

const VERDICT_COLORS = {
  YTA: '#E24B4A',
  NTA: '#639922',
  ESH: '#EF9F27',
  NAH: '#378ADD'
};

const VERDICT_COLORS_DARK = {
  YTA: '#ff5857',
  NTA: '#74c414',
  ESH: '#ffa929',
  NAH: '#409fff'
};


export default function VerdictChart({ postId, verdicts }) {
  const verdictData = verdicts[postId];
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const computedColorScheme = useComputedColorScheme('light');
  const dark = computedColorScheme === 'dark';
  const labelColor = dark ? '#c9c9c9' : '#000000';
  const COLORS = dark ? VERDICT_COLORS_DARK : VERDICT_COLORS;
  const verdictsDontMatch = verdictData && verdictData.labelledVerdict !== verdictData.crowdVerdictByScore;

  useEffect(() => {
    if (!verdictData || !chartRef.current) return;

    chartInstance.current?.destroy();

    const counts = verdictData.scoreSums;
    const labels = ['YTA', 'NTA', 'ESH', 'NAH'].filter(l => counts[l] > 0 || l === "NTA" || l === "YTA"); // Always show YTA/NTA even if 0 votes
    const values = labels.map(l => counts[l]);

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map(l => COLORS[l] + 'cc'),
          borderColor: labels.map(l => COLORS[l]),
          borderWidth: 1,
          borderRadius: 4,
          minBarLength: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} ${ctx.parsed.y >= 0 ? 'upvotes' : 'downvotes'}` } },
          datalabels: {
            color: dark ? '#FFF' : '#000',
            anchor: 'end',
            align: 'end',
            // clamp: true,
            font: { weight: 'bold' },
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: labelColor } },
          y: { beginAtZero: true, ticks: { precision: 0, color: labelColor } }
        },
        layout: {
          padding: {
            top: 20,
          },
        }
      }
    });

    return () => chartInstance.current?.destroy();
  }, [postId, verdictData, dark]);

  if (!verdictData) return null;

  return (
    <Stack gap="xs" mt="md">
      <Group justify="center" gap="4px">
        <Text size="sm" ta="center">
          How Reddit voted
        </Text>
        <Tooltip
          label="Total upvotes by verdict type, based on comment votes"
          withArrow
          color="gray.7"
          position="top"
        >
          <IconInfoCircle size={16} style={{ cursor: 'pointer' }} />
        </Tooltip>
      </Group>
      <div style={{ position: 'relative', height: '200px' }}>
        <canvas
          ref={chartRef}
          role="img"
          aria-label={`Reddit verdict breakdown for this post`}
        />
      </div>
      {verdictsDontMatch && (
        <Alert color="gray" title="Why does the verdict not match the most voted option?">
          In /r/AmITheAsshole, the top voted comment after 18 hours<br/>is chosen as the official verdict. 
        </Alert>
      )}
    </Stack>
  );
}
