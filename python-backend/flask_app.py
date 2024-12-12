from flask import Flask, jsonify, request  # Make sure to import 'request'
from pymongo import MongoClient
import pandas as pd
from flask_cors import CORS
from datetime import datetime


app = Flask(__name__)
CORS(app)

pre_data = ""

# Connect to MongoDB
client = MongoClient('mongodb://127.0.0.1:27017')
db = client['holiday_data']

# Define a function to fetch and process data
def fetch_and_process_data():
    # Read flight_data into a DataFrame
    flight_data = db["us-air.clean-passenger-info"]
    flight_data_df = pd.DataFrame(list(flight_data.find({}, {
        'YEAR': 1, 'MONTH': 1, 'PASSENGERS': 1, 'SEATS': 1, '_id': 0
    })))

    # Read holiday_data into a DataFrame
    holiday_data = db["holiday_data"]
    holiday_data_df = pd.DataFrame(list(holiday_data.find({}, {
        'Year': 1, 'Month': 1, 'Holiday': 1, '_id': 0
    })))

    # Rename columns in holiday_data to match flight_data
    holiday_data_df = holiday_data_df.rename(columns={'Year': 'YEAR', 'Month': 'MONTH'})

    # Merge the DataFrames
    merged_data_1 = pd.merge(flight_data_df, holiday_data_df, on=['YEAR', 'MONTH'], how='left')

    # Fill NaN values in Holiday column
    merged_data_1['Holiday'] = merged_data_1['Holiday'].fillna('No Holiday')

    # Filter out invalid data
    merged_data_1 = merged_data_1[(merged_data_1['SEATS'] > 0) & (merged_data_1['PASSENGERS'] >= 0)]

    # Calculate seat utilization
    merged_data_1['Seat_Utilization'] = (merged_data_1['PASSENGERS'] / merged_data_1['SEATS']) * 100

    # Create a date column for plotting
    merged_data_1['Date'] = pd.to_datetime(merged_data_1.apply(lambda row: f"{row['YEAR']}-{row['MONTH']:02d}-01", axis=1))

    # Group by Date and Holiday, and calculate mean seat utilization
    holiday_seat_utilization = merged_data_1.groupby(['Date', 'Holiday'])['Seat_Utilization'].mean().reset_index()

    # Find the top holidays for air travel based on seat utilization
    top_holidays = holiday_seat_utilization.sort_values(by='Seat_Utilization', ascending=False).head(10)

    return top_holidays.to_dict(orient='records')


def parse_date(date_str):
    return datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S %Z')
# Define the API route
@app.route('/top_holidays', methods=['GET'])
def get_top_holidays():
    #data = fetch_and_process_data()
    return jsonify({'top_holidays': pre_data})

@app.route('/result', methods=['GET'])
def index():
    # Get start and end dates from query parameters
    start_date_str = request.args.get('start')
    end_date_str = request.args.get('end')

    # If both dates are provided, parse them
    if start_date_str and end_date_str:
        start_date = parse_date(start_date_str)
        end_date = parse_date(end_date_str)

        collection = db['top_holidays']
        
        # Fetch data from MongoDB
        data = collection.find({
            'Date': {'$gte': start_date, '$lte': end_date}
        })

        # Process the data as needed
        processed_data = []
        for item in data:
            processed_item = {
                'date': item['Date'],
                'holiday': item['Holiday'],
                'seat_utilization': item['Seat_Utilization']
            }
            processed_data.append(processed_item)

        return jsonify(processed_data)
    
    return jsonify({'error': 'Please provide both start and end dates in the correct format.'}), 400

if __name__ == '__main__':

    #pre_data = fetch_and_process_data()
    app.run(debug=True)
