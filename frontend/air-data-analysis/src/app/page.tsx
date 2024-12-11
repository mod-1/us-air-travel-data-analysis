"use client"
import * as React from 'react';
import {Typography,Box, Stack, Checkbox, Button} from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Line, XAxis, YAxis,Tooltip } from 'recharts';
import dynamic from "next/dynamic"
import apiClient from "./axios"

// Dynamically import LineChart and related components with SSR disabled
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });

const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });



export default function Home() {


  const [source, setSource] = React.useState<string>("");
  const [filters,setFilters] = React.useState<string[]>([]);

  const DummyDataSource:Map<string,number> = new Map<string,number>();
  DummyDataSource.set("flightEcon",0);
  DummyDataSource.set("GDP",1);

  const [data,setData] = React.useState([
    { name: 'Jan', uv: 400, pv: 2400 },
    { name: 'Feb', uv: 300, pv: 1398 },
    { name: 'Mar', uv: 200, pv: 9800 },
    { name: 'Apr', uv: 278, pv: 3908 },
    { name: 'May', uv: 189, pv: 4800 },
  ]);
  
  const Filters:string[][] = [
    ["filter1_econ","filter2_econ","filter3_econ"],
    ["filter1_GDP","filter2_GDP"],
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (source == "GDP") {
      apiClient.get("/api/gdp").then((data) => {
        console.log(data);
      })
    } else {
      apiClient.get("/api/flightEcon").then((data) => {
        console.log(data);
      })
    }
  }
  const handleSourceChange = (event: SelectChangeEvent) => {
    setSource(event.target.value as string);
  };
  const handleFiltersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((filters) => [...filters,event.target.value as string]);
  }
   return (
    <Box
    sx={{
      display: 'flex',              // Flexbox to center content
      flexDirection: 'column',      // Stack elements vertically
      alignItems: 'center',         // Horizontally center content
      justifyContent: 'top',     // Vertically center content
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
        </Select>
      </FormControl>
      <Typography color="black">
      Choose some filters:
    </Typography>
    <Stack direction={"row"}>
    {source==""?null:
          Filters[DummyDataSource.get(source) as number].map((value,index) => 
            (
              <FormControlLabel key={`${index}-${value}`} control={<Checkbox />} label={value} sx={{ color: 'black' }}  />
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
        <Line type="monotone" dataKey="uv" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="pv" stroke="#82ca9d" />
      </LineChart>

  </Box>
  );
}
