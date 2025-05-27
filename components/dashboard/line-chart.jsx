"use client";
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function LineChart({statData}) {
  
  // Handle empty data state
  if (!statData || statData?.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        Loading PR activity data...
      </div>
    );
  }
  
  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLine
          data={statData}
          margin={{ top: 5, right: 20, left: 10, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            label={{ 
              value: "Pull Requests", 
              angle: -90, 
              position: "insideLeft", 
              fill: "hsl(var(--muted-foreground))",
              fontSize: 11
            }}
          />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "0.5rem",
            fontSize: "11px"
          }}
          labelStyle={{
            fontSize: "11px",
            color: "hsl(var(--card-foreground))" 
          }}
          itemStyle={{
            fontSize: "11px",
            color: "hsl(var(--card-foreground))"
          }}
        />

          <Legend 
            verticalAlign="top" 
            height={36} 
            wrapperStyle={{ fontSize: "11px" }}
          />
          <Line
            type="monotone"
            dataKey="merged"
            name="Merged PRs"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))" }}
            activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
          />
          <Line
            type="monotone"
            dataKey="closed"
            name="Closed PRs"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--destructive))" }}
          />
          <Line
            type="monotone"
            dataKey="open"
            name="Open PRs"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{ fill: "#82ca9d" }}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Total PRs"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--secondary))" }}
          />
        </RechartsLine>
      </ResponsiveContainer>
    </div>
  );
}