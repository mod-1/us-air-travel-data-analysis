import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  Legend,
  YAxis,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const HolidayLineGraph = ({ startDate, endDate }) => {
  const [data, setData] = useState([]); // Data for the graph
  const [holidays, setHolidays] = useState([]); // Unique holidays for lines

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/result?start=${startDate}&end=${endDate}`
        ); // Replace with your API URL
        const result = await response.json();

        // Format the data for proper graph rendering
        const formattedData = result.map((item) => ({
          year: dayjs(item.date).year(), // Extract the year
          seat_utilization: item.seat_utilization,
          holiday: item.holiday,
        }));

        // Extract unique holidays
        const uniqueHolidays = [...new Set(formattedData.map((item) => item.holiday))];
        setHolidays(uniqueHolidays);
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        {/* X-axis shows years instead of indexes */}
        <XAxis
          dataKey="year"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(tick) => tick.toString()} // Format year as string
          label={{ value: "Year", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          domain={[0, 100]}
          label={{ value: "Seat Utilization (%)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />

        {/* Plot a line for each unique holiday */}
        {holidays.map((holiday, index) => {
          const lineColor = `hsl(${(index * 360) / holidays.length}, 70%, 50%)`; // Generate a unique color
          const holidayData = data.filter((d) => d.holiday === holiday);

          return (
            <Line
              key={holiday}
              type="monotone"
              data={holidayData}
              dataKey="seat_utilization"
              stroke={lineColor}
              name={holiday}
              dot={false}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HolidayLineGraph;
