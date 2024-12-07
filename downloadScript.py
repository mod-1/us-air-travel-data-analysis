import requests
from bs4 import BeautifulSoup
import os

# URL to the flight data page
financial_data_url = "https://www.transtats.bts.gov/DL_SelectFields.aspx?gnoyr_VQ=FKM&QO_fu146_anzr=Nv4%20Pn44vr4%20Sv0n0pvny"
market_data_url = "https://www.transtats.bts.gov/DL_SelectFields.aspx?gnoyr_VQ=FIL&QO_fu146_anzr=Nv4%20Pn44vr45"

folderName=input("What should be the name of folder? ")
data_type = input("What data do you want to download? Enter 1 for Financial Data and 2 for Market Data: ")
url = market_data_url if data_type == "2" else financial_data_url

# Directory to save downloaded files
DOWNLOAD_DIR = f"flight_data/{folderName}"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def fetch_form_data(session, url):
    """Fetch __VIEWSTATE, __VIEWSTATEGENERATOR, and __EVENTVALIDATION from the page."""
    response = session.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to load the page. Status code: {response.status_code}")
    
    soup = BeautifulSoup(response.text, "html.parser")
    viewstate = soup.find("input", {"id": "__VIEWSTATE"})["value"]
    viewstategenerator = soup.find("input", {"id": "__VIEWSTATEGENERATOR"})["value"]
    eventvalidation = soup.find("input", {"id": "__EVENTVALIDATION"})["value"]
    
    return {
        "__VIEWSTATE": viewstate,
        "__VIEWSTATEGENERATOR": viewstategenerator,
        "__EVENTVALIDATION": eventvalidation
    }

def download_data(session, year, form_data):
    """Download the flight data for a given year."""
    form_data.update({
        "txtSearch": "",
        "cboGeography": "All",
        "cboYear": str(year),
        "cboPeriod": "All",
        "chkAllVars":"on",
        "btnDownload": "Download",
        # "PASSENGERS": "on",
        # "UNIQUE_CARRIER": "on",
        # "UNIQUE_CARRIER_NAME": "on",
        # "ORIGIN_AIRPORT_ID": "on",
        # "ORIGIN": "on",
        # "DEST_AIRPORT_ID": "on",
        # "DEST": "on",
        # "AIRCRAFT_TYPE": "on",
        # "MONTH": "on",
    })

    response = session.post(url, data=form_data, stream=True)
    if response.status_code != 200:
        print(f"Failed to download data for year {year}: {response.status_code}")
        return

    # Save the downloaded file
    filename = os.path.join(DOWNLOAD_DIR, f"data_{year}.zip")
    with open(filename, "wb") as file:
        for chunk in response.iter_content(chunk_size=1024):
            file.write(chunk)
    print(f"Downloaded data for year {year} to {filename}")

def main():
    with requests.Session() as session:
        # Fetch initial form data
        print("Fetching form data...")
        form_data = fetch_form_data(session, url)
        
        # Download data for each year
        for year in range(2000, 2024):
            print(f"Downloading data for year {year}...")
            try:
                download_data(session, year, form_data)
            except Exception as e:
                print(f"Error downloading data for year {year}: {e}")

        print("All downloads completed!")

if __name__ == "__main__":
    main()
