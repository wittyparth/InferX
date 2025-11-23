"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartCard } from "./chart-card"

const performanceData = [
  { month: "Jan", accuracy: 92, precision: 88, recall: 85 },
  { month: "Feb", accuracy: 94, precision: 90, recall: 87 },
  { month: "Mar", accuracy: 96, precision: 93, recall: 91 },
  { month: "Apr", accuracy: 95, precision: 92, recall: 89 },
  { month: "May", accuracy: 97, precision: 95, recall: 93 },
  { month: "Jun", accuracy: 98, precision: 96, recall: 94 },
]

const predictionData = [
  { name: "Successful", value: 1240, color: "#55C8FF" },
  { name: "Failed", value: 120, color: "#FF6B6B" },
  { name: "Pending", value: 340, color: "#FFB84D" },
]

const usageData = [
  { day: "Mon", requests: 2400, errors: 240 },
  { day: "Tue", requests: 1398, errors: 221 },
  { day: "Wed", requests: 9800, errors: 229 },
  { day: "Thu", requests: 3908, errors: 200 },
  { day: "Fri", requests: 4800, errors: 218 },
  { day: "Sat", requests: 3800, errors: 250 },
  { day: "Sun", requests: 4300, errors: 210 },
]

export function DashboardCharts() {
  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <ChartCard title="Model Performance" description="Accuracy, Precision, and Recall trends over time" delay={0.3}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(12, 12, 12, 0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="accuracy" stroke="#55C8FF" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="precision" stroke="#00D9FF" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="recall" stroke="#FFB84D" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Status */}
        <ChartCard title="Prediction Status" description="Distribution of prediction outcomes" delay={0.4}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={predictionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {predictionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(12, 12, 12, 0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* API Usage */}
        <ChartCard title="API Usage" description="Daily requests and error rates" delay={0.5}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(12, 12, 12, 0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="requests" fill="#55C8FF" radius={[8, 8, 0, 0]} />
              <Bar dataKey="errors" fill="#FF6B6B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
