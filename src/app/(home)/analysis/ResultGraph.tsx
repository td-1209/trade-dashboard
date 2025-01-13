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
        max: 200,  // Y軸の最大値
        min: -800, // Y軸の最小値
        beginAtZero: false,
        grid: {
          color: (context: { tick: { value: number }, scale: { min: number, max: number } }) => {
            if (context.tick.value === 0) {
              return '#C51162'; // 0の位置の線を赤色に
            }
            return '#333333'; // その他の線は薄いグレー
          },
          lineWidth: (context: { tick: { value: number } }) => {
            if (context.tick.value === 0) {
              return 2; // 0の位置の線を太く
            }
            return 1; // その他の線は通常の太さ
          }
        }
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

  const convertToDateFormat = (label: string) => {
    const datePart = label.split('_')[0];
    return new Date(datePart).toISOString();
  };

  useEffect(() => {
    const fetchData = async () => {
      const [newRecords] = await Promise.all([
        fetchGETRequestItems<PlRecord>({ endpoint: '/api/pl/read-all-items' }),
      ]);
      if (newRecords) {
        // データの加工
        const formattedDisplayRecords = newRecords.map(record => ({
          id: record.id,
          enteredAt: convertToDateFormat(record.enteredAt),
          exitedAt: convertToDateFormat(record.exitedAt),
          profitLossPips: calculatePips({
            quoteCurrency: record.quoteCurrency,
            entryPrice: record.entryPrice,
            exitPrice: record.exitPrice,
            position: record.position
          }),
          isSettled: record.isSettled,
        }));
        formattedDisplayRecords.sort((b, a) => 
          new Date(b.exitedAt).getTime() - new Date(a.exitedAt).getTime()
        );

        // 決済済みのレコードのみを抽出
        const settledRecords = formattedDisplayRecords.filter(record => record.isSettled);

        // 累積pipsを計算
        let cumulativePips = 0;
        const cumulativeData = settledRecords.map(record => {
          cumulativePips += record.profitLossPips;
          return {
            exitedAt: record.exitedAt,
            profitLossPips: cumulativePips
          };
        });


        // 可視化データとして加工
        const newChartData = {
          labels: cumulativeData.map(record => record.exitedAt),
          datasets: [
            {
              label: 'Pips',
              data: cumulativeData.map(record => record.profitLossPips),
              borderColor: '#448AFF',
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