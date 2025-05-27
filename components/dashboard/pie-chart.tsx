"use client";
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: DataItem[];
}

export function PieChart({ data }: PieChartProps) {
  // Calculate total for percentage calculations
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Check if there's no data or all values are 0
  const hasData = total > 0;
 
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, name, value } = props;
    if (value === 0) return null;
   
    const percent = (value / total) * 100;
    if (percent < 1) return null;
   
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
   
    const textAnchor = x > cx ? 'start' : 'end';    
    const xOffset = x > cx ? 5 : -5;
   
    return (
      <g>
        {/* Line connecting pie to label */}
        <path
          d={`M${cx + (outerRadius * 0.95) * Math.cos(-midAngle * RADIAN)},${cy + (outerRadius * 0.95) * Math.sin(-midAngle * RADIAN)}L${x - xOffset/2},${y}`}
          stroke="currentColor"
          strokeOpacity={0.5}
          fill="none"
          strokeWidth={1}
        />
       
        {/* The label text */}
        <text
          x={x + xOffset}
          y={y}
          fill="currentColor"
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize="0.8rem"
          opacity={0.75}
        >
          {`${name} (${percent.toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  // Empty state component
  const EmptyState = () => (
    <div className="w-full h-[250px] flex flex-col items-center justify-center text-center">
      <div className="w-32 h-32 rounded-full border-4 border-dashed border-border flex items-center justify-center mb-4 bg-muted/30">
        <svg 
          className="w-12 h-12 text-muted-foreground" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No Pull Requests Yet</h3>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        Once you start creating pull requests, your activity will be visualized here.
      </p>
    </div>
  );

  // If no data, show empty state
  if (!hasData) {
    return <EmptyState />;
  }

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={renderCustomizedLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`hsl(var(--${entry.color}))`}
              />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              fontSize: '0.75rem'
            }}
          />
          <Tooltip
            formatter={(value: number) => [value, 'Pull Requests']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '0.7rem',
              padding: '0.25rem 0.5rem',
            }}
            itemStyle={{
              color: 'hsl(var(--card-foreground))',
              fontSize: '0.7rem',
            }}
            labelStyle={{
              color: 'hsl(var(--card-foreground))',
              fontSize: '0.7rem',
            }}
          />
        </RechartsChart>
      </ResponsiveContainer>
    </div>
  );
}