"use client";
import * as React from 'react';
import { Typography, Box, Stack, Checkbox, Button } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Line, XAxis, YAxis, Tooltip } from 'recharts';
import dynamic from "next/dynamic";
import apiClient from "./axios";

// Dynamically import LineChart and related components with SSR disabled
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });

export default function Home() {
  const [source, setSource] = React.useState<string>("");
  const [filters, setFilters] = React.useState<string[]>([]);
  const [data, setData] = React.useState<any[]>([]);

  const DummyDataSource: Map<string, number> = new Map<string, number>();
  DummyDataSource.set("flightEcon", 0);
  DummyDataSource.set("GDP", 1);
  DummyDataSource.set("employment", 2);

  const Filters: string[][] = [
    ["filter1_econ", "filter2_econ", "filter3_econ"],
    ["filter1_GDP", "filter2_GDP"],
    ["filter1_emp", "filter2_emp"],
  ];

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (source === "GDP") {
      const response = await apiClient.get("/api/gdp");
      console.log(response.data);
    } else if (source === "flightEcon") {
      const response = await apiClient.get("/api/flightEcon");
      console.log(response.data);
    } else if (source === "employment") {
      const response = await apiClient.get("/api/employee?state=MA&inbound=true");
      const employmentData = response.data.empWithPass;

      // Sort by year then month
      employmentData.sort(
        (a: { YEAR: number; MONTH: number }, b: { YEAR: number; MONTH: number }) =>
          a.YEAR - b.YEAR || a.MONTH - b.MONTH
      );

      // Prepare data for plotting
      const formattedData = (() => {
        // Extract min and max values for normalization
        const minMax = employmentData.reduce(
          (acc, doc) => {
            acc.minPassengers = Math.min(acc.minPassengers, doc.total_passengers);
            acc.maxPassengers = Math.max(acc.maxPassengers, doc.total_passengers);
            acc.minEmployees = Math.min(acc.minEmployees, doc.total_employees);
            acc.maxEmployees = Math.max(acc.maxEmployees, doc.total_employees);
            return acc;
          },
          {
            minPassengers: Infinity,
            maxPassengers: -Infinity,
            minEmployees: Infinity,
            maxEmployees: -Infinity,
          }
        );
      
        // Normalize the fields
        return employmentData.map((doc: { YEAR: number; MONTH: number; total_passengers: number; total_employees: number }) => ({
          name: `${doc.YEAR}-${doc.MONTH}`,
          total_passengers: (doc.total_passengers - minMax.minPassengers) / (minMax.maxPassengers - minMax.minPassengers),
          total_employees: (doc.total_employees - minMax.minEmployees) / (minMax.maxEmployees - minMax.minEmployees),
        }));
      })();
      console.warn(formattedData);
      setData(formattedData);
    }
  };

  const handleSourceChange = (event: SelectChangeEvent) => {
    setSource(event.target.value as string);
  };

  const handleFiltersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((filters) => [...filters, event.target.value as string]);
  };

  return (
    <Box
      sx={{
        display: 'flex',              // Flexbox to center content
        flexDirection: 'column',      // Stack elements vertically
        alignItems: 'center',         // Horizontally center content
        justifyContent: 'top',        // Vertically center content
        minHeight: '100vh',           // Full viewport height
        backgroundColor: '#f0f0f0',   // Light background color
        padding: 2,                   // Padding around the content
      }}
    >
      <Typography variant="h2" color="black">Air data analysis</Typography>
      <Typography color="black">
        Choose a data source:
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Data source</InputLabel>
        <Select
          value={source}
          label="Data Source"
          onChange={handleSourceChange}
          fullWidth={true}
        >
          <MenuItem value={"flightEcon"}>flightEcon</MenuItem>
          <MenuItem value={"GDP"}>GDP</MenuItem>
          <MenuItem value={"employment"}>Employment</MenuItem>
        </Select>
      </FormControl>
      <Typography color="black">
        Choose some filters:
      </Typography>
      <Stack direction={"row"}>
        {source === "" ? null :
          Filters[DummyDataSource.get(source) as number].map((value, index) => (
            <FormControlLabel key={`${index}-${value}`} control={<Checkbox />} label={value} sx={{ color: 'black' }} />
          ))}
        <Button variant='outlined' onClick={handleClick}>
          Plot
        </Button>
      </Stack>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {data.length > 0 && Object.keys(data[0])
          .filter(key => key !== "name")
          .map((key) => (
            <Line key={key} type="monotone" dataKey={key} stroke={getColor(key)} />
          ))}
      </LineChart>
    </Box>
  );

  // Function to generate a unique color for each line
  function getColor(key: string): string {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];
    const index = Object.keys(data[0] || {}).indexOf(key) % colors.length;
    return colors[index];
  }
}