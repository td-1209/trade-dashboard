/* eslint-disable no-irregular-whitespace */
'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Scale
} from 'chart.js';
import { PlRecord } from '@/types/type';
import { calculatePips } from '@/lib/calc';
import { fetchGETRequestItems } from '@/lib/request';
import { sortItems } from '@/lib/dynamodb';

ChartJS.register(
  CategoryScale,
  LinearScale, 
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  labels: string[];
  datasets: {
      label: string;
      data: number[];
      borderColor: string;
      tension: number;
  }[];
}

const initialChartData: ChartData = {
  labels: [],
  datasets: [
    {
      label: '',
      data: [],
      borderColor: '',
      tension: 0
    },
  ]
};

export const ResultGraph = () => {
  const [chartData, setChartData] = useState<ChartData>(initialChartData);
  const [isLoading, setIsLoading] = useState(true);
  const options = {
    responsive: true,
    maintainAspectRatio: false, // 縦横比を固定しない
    height: 200, // 高さを200pxに固定
    plugins: {
      legend: {
        display: false // 判例を非表示
      },
      title: {
        display: false // タイトルを非表示
      }
    },
    scales: {
      y: {
        min: -300, // Y軸の最小値
        max: 300,  // Y軸の最大値
        beginAtZero: false
      },
      x: {
        ticks: {
          maxRotation: 90, // x軸のラベルを縦書きに
          minRotation: 90,
          callback: function(this: Scale, value: string | number, index: number): string {
            // 日付のみを表示 (MM/dd形式)
            const label = chartData.labels[index];
            return label ? label.split('_')[0].slice(5) : '';
          }
        }
      }
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const [newRecords] = await Promise.all([
        fetchGETRequestItems<PlRecord>({ endpoint: '/api/pl/read-all-items' }),
      ]);
      if (newRecords) {
        // データの加工
        const sortedRecords = sortItems<PlRecord>({ items: newRecords, keyName: 'id', type: 'DSC'});
        const formattedDisplayRecords = sortedRecords.map(record => ({
          id: record.id,
          exitedAt: record.exitedAt,
          profitLossPips: calculatePips({
            quoteCurrency: record.quoteCurrency,
            entryPrice: record.entryPrice,
            exitPrice: record.exitPrice,
            position: record.position
          }),
          isSettled: record.isSettled,
        }));

        // 決済済みのレコードのみを抽出
        const settledRecords = formattedDisplayRecords.filter(record => record.isSettled);

        // settledRecordsの、exitedAtをX軸とprofitLossPipsをY軸として可視化したい
        const newChartData = {
          labels: settledRecords.map(record => record.exitedAt),
          datasets: [
            {
              label: 'Pips',
              data: settledRecords.map(record => record.profitLossPips),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }
          ]
        };

        // 情報を記録
        setChartData(newChartData);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 px-4 gap-4'>
        {[...Array(10)].map((_, index) => (
          <ItemLoading key={index} />
        ))}
      </div>
    );
  } else {
    return (
      <div className='grid grid-cols-1 px-4 gap-4'>
        <Line data={chartData} options={options} />
      </div>
    );
  }
};

const ItemLoading = () => {
  return(
    <></>
  );
};