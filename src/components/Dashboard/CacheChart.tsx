import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';

interface CacheChartProps {
  data: {
    time: string;
    cached: number;
    fresh: number;
  }[];
}

const CacheChart: React.FC<CacheChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cached vs. Fresh Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorCached" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFresh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid #ccc'
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="cached" name="Cached" stackId="1" stroke="#8884d8" fillOpacity={1} fill="url(#colorCached)" />
            <Area type="monotone" dataKey="fresh" name="Fresh" stackId="1" stroke="#82ca9d" fillOpacity={1} fill="url(#colorFresh)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CacheChart;