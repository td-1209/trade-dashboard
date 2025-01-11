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
  TimeScale
} from 'chart.js';
import { ja } from 'date-fns/locale';
import { PlRecord } from '@/types/type';
import { calculatePips } from '@/lib/calc';
import { fetchGETRequestItems } from '@/lib/request';
import { sortItems } from '@/lib/dynamodb';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale, 
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
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
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'MM/dd'
          }
        },
        adapters: {
          date: {
            locale: ja
          }
        },
        ticks: {
          maxRotation: 90, // x軸のラベルを縦書きに
          minRotation: 90
        }
      }
    }
  };

  const convertToDateFormat = (labels: string[]) => {
    return labels.map(label => {
      const datePart = label.split('_')[0];
      return new Date(datePart);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const [newRecords] = await Promise.all([
        fetchGETRequestItems<PlRecord>({ endpoint: '/api/pl/read-all-items' }),
      ]);
      if (newRecords) {
        // データの加工
        const sortedRecords = sortItems<PlRecord>({ items: newRecords, keyName: 'id', type: 'ASC'});
        const formattedDisplayRecords = sortedRecords.map(record => ({
          id: record.id,
          enteredAt: record.enteredAt,
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

        // 可視化データとして加工
        const newChartData = {
          labels: convertToDateFormat(settledRecords.map(record => record.exitedAt)).map(date => date.toISOString()),
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