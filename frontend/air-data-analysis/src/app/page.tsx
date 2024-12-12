"use client";
import * as React from 'react';
import { Typography, Stack, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
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
  '21 Air LLC',
  'ABX Air Inc',
  'ATA Airlines d/b/a ATA',
  'Aerodynamics Inc. d/b/a SkyValue d/b/a SkyValue Airways',
  'Air Transport International',
  'Air Wisconsin Airlines Corp',
  'AirTran Airways Corporation',
  'Alaska Airlines Inc.',
  'Allegiant Air',
  'Aloha Air Cargo',
  'Aloha Airlines Inc.',
  'America West Airlines Inc.',
  'American Airlines Inc.',
  'Amerijet International',
  'Arrow Air Inc.',
  'Asia Pacific',
  'Astar USA, LLC',
  'Atlas Air Inc.',
  'Avjet Corporation',
  'Boston-Maine Airways',
  'Breeze Aviation Group DBA  Breeze',
  'Capital Cargo International',
  'Cargo 360, Inc.',
  'Caribbean Sun Airlines, Inc. d/b/a World Atlantic Airlines',
  'Centurion Cargo Inc.',
  'Champion Air',
  'Chautauqua Airlines Inc.',
  'Colgan Air',
  'Comair Inc.',
  'CommuteAir LLC dba CommuteAir',
  'Compass Airlines',
  'Continental Air Lines Inc.',
  'Continental Micronesia',
  'Custom Air Transport',
  'Delta Air Lines Inc.',
  'EOS Airlines, Inc.',
  'Eastern Air Express, LLC (EAX)',
  'Eastern Airlines Group Inc.',
  'Eastern Airlines f/k/a Dynamic Airways, LLC',
  'Elite Airways LLC',
  'Emery Worldwide Airlines',
  'Endeavor Air Inc.',
  'Envoy Air',
  'Evergreen International Inc.',
  'Executive Airlines',
  'Express One International Inc.',
  'Express.Net Airlines',
  'ExpressJet Airlines Inc.',
  'ExpressJet Airlines LLC d/b/a aha!',
  'Falcon Air Express',
  'Federal Express Corporation',
  'Fine Airlines Inc.',
  'Florida West Airlines Inc.',
  'Freedom Airlines d/b/a HP Expr',
  'Frontier Airlines Inc.',
  'Gemini Air Cargo Airways',
  'Global Crossing Airlines, Inc.',
  'GoJet Airlines LLC d/b/a United Express',
  'Gulf And Caribbean Cargo',
  'Hawaiian Airlines Inc.',
  'Horizon Air',
  'Independence Air',
  'Island Air Hawaii',
  'Jet Aviation Flight Services, Inc.',
  'JetBlue Airways',
  'Kalitta Air LLC',
  'Kalitta Charters II',
  'Kitty Hawk Aircargo',
  'Legend Airlines',
  'Lynden Air Cargo Airlines',
  'Lynx Aviation d/b/a Frontier Airlines',
  'Mesa Airlines Inc.',
  'Mesaba Airlines',
  'Miami Air International',
  'Midway Airlines Inc.',
  'Midwest Airline, Inc.',
  'National Air Cargo Group Inc d/ba National Airlines',
  'National Airlines',
  'North American Airlines',
  'Northern Air Cargo Inc.',
  'Northwest Airlines Inc.',
  'Omega Air Holdings d/b/a Focus Air',
  'Omni Air International LLC',
  'PSA Airlines Inc.',
  'Pace Airlines',
  'Pan American Airways Corp.',
  'Piedmont Airlines',
  'Polar Air Cargo Airways',
  'Primaris Airlines Inc.',
  'Pro Air Inc.',
  'Reeve Aleutian Airways Inc.',
  'Reliant Airlines',
  'Republic Airline',
  'Rhoades Aviation dba Transair',
  'Ryan International Airlines',
  'Scott Aviation, LLC  d/b/a  Silver Air',
  'Shuttle America Corp.',
  'Silver Airways',
  'Sky King Inc.',
  'Sky Lease Cargo',
];

const econFields= [
              'CASH',               'SHORT_TERM_INV',
  'NOTES_RECEIVABLE',  'ACCTS_RECEIVABLE',   'ACCTS_NOT_COLLECT',
  'NOTES_ACC_REC_NET', 'PARTS_SUPPLIES_NET', 'PREPAID_ITEMS',
  'CURR_ASSETS_OTH',   'CURR_ASSETS',        'INVEST_ASSOC_COMP',
  'INVEST_REC_OTH',    'SPECIAL_FUNDS',      'INVEST_SPEC_FUNDS',
  'FLIGHT_EQUIP',      'PROP_EQUIP_GROUND',  'DEPR_PR_EQ_GROUND',
  'PROP_EQUIP_NET',    'LAND',               'EQUIP_DEP_ADV_PAY',
  'CONSTRUCTION',      'LEASED_PROP_CAP',    'LEASED_PROP_ACC',
  'PROP_EQUIP',        'PROP_EQUIP_NON_OP',  'DEPR_PR_EQ_NON_OP',
  'PROP_EQUIP_NO_TOT', 'PRE_PAY_LONG_TERM',  'NON_AMORT_DEV',
  'ASSETS_OTH_DEF',    'ASSETS_OTHER',       'ASSETS',
  'LONG_DEBT_CUR_MAT', 'NOTES_PAY_BANKS',    'NOTES_PAY_OTHER',
  'ACCTS_PAY_TRADE',   'ACCTS_PAY_OTHER',    'CURR_OB_CAP_LEASE',
  'ACCR_SALARIES',     'ACCR_VACATION',      'ACCR_INTEREST',
  'ACCR_TAXES',        'DIVIDENDS',          'LIAB_AIR_TRAFFIC',
  'CURR_LIAB_OTH',     'CURR_LIABILITIES',   'LONG_TERM_DEBT',
  'ADV_ASSOC_COMP',    'PENSION_LIAB',       'NON_REC_OB_CAP_LS',
  'NON_REC_LIAB_OTH',  'NON_REC_LIAB',       'DEF_TAXES',
  'DEF_TAX_CREDITS',   'DEF_CREDITS_OTH',    'DEF_CREDITS',
  'PF_SHARES',         'PF_SHARES_NUM',      'COM_SHARES',
  'UNISSUED_STOCK',    'CAPITAL_STOCK',      'ADD_CAPITAL_INV',
  'PAID_IN_CAPITAL',   'RET_EARNINGS',       'SH_HLD_EQUITY',
  'TREAS_STOCK_NUM',   'SH_HLD_EQUIT_NET',   'LIAB_SH_HLD_EQUITY',
  'AIRLINE_ID',        'UNIQUE_CARRIER',     'UNIQUE_CARRIER_NAME',
  'CARRIER',           'CARRIER_NAME',       'UNIQUE_CARRIER_ENTITY',
  'REGION',            'CARRIER_GROUP_NEW',  'CARRIER_GROUP',
  'YEAR',              'QUARTER'
]

const booleanOptions = ['true', 'false'];

export default function Home() {
  const [source, setSource] = React.useState<string>("");
  const [stateFilter, setStateFilter] = React.useState<string>("");
  const [carrierFilter, setCarrierFilter] = React.useState<string>("");
  const [econFilter, setEconFilter] = React.useState<string>("");
  const [startCalendarValue, setStartCalendarValue] = React.useState<Dayjs | null>(dayjs('2000-04-17'));
  const [endCalendarValue, setEndCalendarValue] = React.useState<Dayjs | null>(dayjs('2024-04-17'));

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
      const response = await apiClient.get(uri,{
        params:{
          "startDate":startCalendarValue?.toString(),
          "endDate":endCalendarValue?.toString()
        }
      });
      const gdpData = response.data;
      const minMax = gdpData.reduce(
          (acc: { minPassengers: number; maxPassengers: number; minGdp: number; maxGdp: number; }, doc: { year: number; quarter: number; passenger_count: number; gdp: number, region: string, _id: object }) => {
            acc.minPassengers = Math.min(acc.minPassengers, doc.passenger_count);
            acc.maxPassengers = Math.max(acc.maxPassengers, doc.passenger_count);
            acc.minGdp = Math.min(acc.minGdp, doc.gdp);
            acc.maxGdp = Math.max(acc.maxGdp, doc.gdp);
            return acc;
          },
          {
            minPassengers: Infinity,
            maxPassengers: -Infinity,
            minGdp: Infinity,
            maxGdp: -Infinity,
          }
        );
      setData(gdpData.map((doc: { year: number; quarter: number; passenger_count: number; gdp: number, region: string, _id: object }) => ({
        name: `${doc.year}-${doc.quarter}`,
        passenger_count: (doc.passenger_count-minMax.minPassengers) / (minMax.maxPassengers - minMax.minPassengers),
        gdp: (doc.gdp-minMax.minGdp) / (minMax.maxGdp - minMax.minGdp),
      })))
    } else if (source === "flightEcon") {
      const response = await apiClient.get("/api/flightEcon",{
        params: {
          "carrierName":carrierFilter,
          "econField":econFilter,
          "startDate":startCalendarValue?.toString(),
          "endDate":endCalendarValue?.toString(),
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
      // console.warn(formattedData);
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
        <XAxis dataKey="name" interval={1} fontSize={"10px"}/>
        <YAxis />
        <Tooltip />
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