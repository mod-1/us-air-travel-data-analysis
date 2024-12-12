"use client";
import * as React from 'react';
import { Typography, Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { Line, XAxis, YAxis, Tooltip } from 'recharts';
import dynamic from "next/dynamic";
import apiClient from "./axios";
import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';

// Dynamically import LineChart and related components with SSR disabled
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });

const states = [
  'AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA',
  'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'
];

const gdpStates = [
  'United States',
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Puerto Rico',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming'
]
const carrierNames = [
  "ExpressJet Airlines Inc."
];

const econFields= [
  "DEF_CREDITS_OTH"
];

const booleanOptions = ['true', 'false'];

export default function Home() {
  const [source, setSource] = React.useState<string>("");
  const [stateFilter, setStateFilter] = React.useState<string>("");
  const [carrierFilter, setCarrierFilter] = React.useState<string>("");
  const [econFilter, setEconFilter] = React.useState<string>("");
  const [startCalendarValue, setStartCalendarValue] = React.useState<Dayjs | null>(dayjs('2022-04-17'));
  const [endCalendarValue, setEndCalendarValue] = React.useState<Dayjs | null>(dayjs('2022-04-17'));

  const [booleanFilter, setBooleanFilter] = React.useState<string>("");
  const [data, setData] = React.useState<any[]>([]);

  const DummyDataSource: Map<string, number> = new Map<string, number>();
  DummyDataSource.set("flightEcon", 0);
  DummyDataSource.set("GDP", 1);
  DummyDataSource.set("employment", 2);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (source === "GDP") {
      let uri = "";
      if (stateFilter === "United States") {
        uri = "/api/gdp";
      } else {
        uri = `/api/gdp?state=${stateFilter}`;
      }
      const response = await apiClient.get(uri);
      const gdpData = response.data;
      setData(gdpData.map((doc: { year: number; quarter: number; passenger_count: number; gdp: number, region: string, _id: object }) => ({
        name: `${doc.year}-${doc.quarter}`,
        passenger_count: doc.passenger_count,
        gdp: doc.gdp,
      })))
    } else if (source === "flightEcon") {
      const response = await apiClient.get("/api/flightEcon",{
        params: {
          "carrierName":carrierFilter,
          "econField":econFilter,
          // "startDate":startCalendarValue?.toString(),
          // "endDate":endCalendarValue?.toString(),
        },
      });
      var flightEconData=response.data;
      console.log(flightEconData);
      // Sort by year then month
      // Normalize the returned data
      const formattedData = (() => {
        const minMax = flightEconData.reduce(
          (acc: { minPassengers: number; maxPassengers: number; minData: number; maxData: number; }, doc: { year: number; quarter: number; passenger_count: number; data: number }) => {
            acc.minPassengers = Math.min(acc.minPassengers, doc.passenger_count);
            acc.maxPassengers = Math.max(acc.maxPassengers, doc.passenger_count);
            acc.minData = Math.min(acc.minData, doc.data);
            acc.maxData = Math.max(acc.maxData, doc.data);
            return acc;
          },
          {
            minPassengers: Infinity,
            maxPassengers: -Infinity,
            minData: Infinity,
            maxData: -Infinity,
          }
        );
        
        flightEconData = flightEconData.map((doc: { year: number; quarter: number; passenger_count: number; data: number }) => ({
          name: `${doc.year}-${doc.quarter}`,
          passenger_count: (doc.passenger_count-minMax.minPassengers)/(minMax.maxPassengers-minMax.minPassengers),
          [econFilter]: (doc.data-minMax.minData)/(minMax.maxData-minMax.minData),
        }));
        console.log(flightEconData);
        return flightEconData;
      })();
      console.warn(formattedData);
      formattedData.sort(
        (a, b) => a.name.localeCompare(b.name)
      );
      setData(formattedData);
    } else if (source === "employment") {
      const response = await apiClient.get(`/api/employee?state=${stateFilter}&inbound=${booleanFilter}`);
      const employmentData = response.data.empWithPass;

      // Sort by year then month
      employmentData.sort(
        (a: { YEAR: number; MONTH: number }, b: { YEAR: number; MONTH: number }) =>
          a.YEAR - b.YEAR || a.MONTH - b.MONTH
      );

      // Normalize the returned data
      const formattedData = (() => {
        const minMax = employmentData.reduce(
          (acc: { minPassengers: number; maxPassengers: number; minEmployees: number; maxEmployees: number; }, doc: { total_passengers: number; total_employees: number; }) => {
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

  const handleStateChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStateFilter(event.target.value as string);
  };

  const handleCarrierChange = (event: React.ChangeEvent<{ value: unknown }>) =>{
    setCarrierFilter(event.target.value as string);
  };

  const handleEconChange = (event: React.ChangeEvent<{ value: unknown }>) =>{
    setEconFilter(event.target.value as string);
  };
  const handleBooleanChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setBooleanFilter(event.target.value as string);
  };

  return (
    <Stack
      sx={{
        alignItems: 'center',         // Horizontally center content
        justifyContent: 'top',        // Vertically center content
        minHeight: '100vh',           // Full viewport height
        backgroundColor: '#f0f0f0',   // Light background color
        padding: 2,                   // Padding around the content
      }}
      direction={"column"}
      spacing={"12px"}
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
      <Stack direction={"row"}>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label="Start date"value={startCalendarValue} onChange={(newValue) => setStartCalendarValue(newValue)} />
          <DatePicker label="End date"value={endCalendarValue} onChange={(newValue) => setEndCalendarValue(newValue)} />
    </LocalizationProvider>
    </Stack>

      {/* Show filters only if 'employment' is selected */}
      {source === "employment" && (
        <>
          <Typography color="black">Select a state:</Typography>
          <FormControl fullWidth>
            <InputLabel>State</InputLabel>
            <Select
              value={stateFilter}
              label="State"
              onChange={handleStateChange}
              fullWidth
            >
              {states.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography color="black">Select inbound (true/false):</Typography>
          <FormControl fullWidth>
            <InputLabel>Inbound</InputLabel>
            <Select
              value={booleanFilter}
              label="Inbound"
              onChange={handleBooleanChange}
              fullWidth
            >
              {booleanOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}
      {source === "GDP" && (
        <>
          <Typography color="black">Select a state:</Typography>
          <FormControl fullWidth>
            <InputLabel>State</InputLabel>
            <Select
              value={stateFilter}
              label="State"
              onChange={handleStateChange}
              fullWidth
            >
              {gdpStates.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                  </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}
      {source === "flightEcon" && (
        <>
          <Typography color="black">Select a Carrier:</Typography>
          <FormControl fullWidth>
            <InputLabel>Carrier Name</InputLabel>
            <Select
              value={carrierFilter}
              label="Carrier"
              onChange={handleCarrierChange}
              fullWidth
            >
              {carrierNames.map((carrier) => (
                <MenuItem key={carrier} value={carrier}>
                  {carrier}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography color="black">Select a Economy Field:</Typography>
          <FormControl fullWidth>
          <InputLabel>Economic Field Name</InputLabel>
            <Select
              value={econFilter}
              label="Econ"
              onChange={handleEconChange}
              fullWidth
            >
              {econFields.map((econField) => (
                <MenuItem key={econField} value={econField}>
                  {econField}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}

      <Button variant='outlined' onClick={handleClick}>
        Plot
      </Button>

      <LineChart width={1500} height={500} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" interval={1}/>
        <YAxis />
        {/* <Tooltip /> */}
        {data.length > 0 && Object.keys(data[0])
          .filter(key => key !== "name")
          .map((key) => (
            <Line key={key} type="monotone" dataKey={key} stroke={getColor(key)} />
          ))}
      </LineChart>
    </Stack>
  );

  // Function to generate a unique color for each line
  function getColor(key: string): string {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];
    const index = Object.keys(data[0] || {}).indexOf(key) % colors.length;
    return colors[index];
  }
}