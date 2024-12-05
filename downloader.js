// downloader of flight data - run this in the console 

(async function() {
    const url = "https://www.transtats.bts.gov/DL_SelectFields.aspx?gnoyr_VQ=FKM&QO_fu146_anzr=Nv4%20Pn44vr4%20Sv0n0pvny";

    const viewstate = document.querySelector("#__VIEWSTATE").value;
    const viewstategenerator = document.querySelector("#__VIEWSTATEGENERATOR").value;
    const eventvalidation = document.querySelector("#__EVENTVALIDATION").value;

    async function downloadData(year) {
        const formData = new URLSearchParams();
        formData.append("__VIEWSTATE", viewstate);
        formData.append("__VIEWSTATEGENERATOR", viewstategenerator);
        formData.append("__EVENTVALIDATION", eventvalidation);
        formData.append("txtSearch", "");
        formData.append("cboGeography", "All");
        formData.append("cboYear", year.toString());
        formData.append("cboPeriod", "All");
        formData.append("btnDownload", "Download");
        formData.append("PASSENGERS", "on");
        formData.append("UNIQUE_CARRIER", "on");
        formData.append("UNIQUE_CARRIER_NAME", "on");
        formData.append("ORIGIN_AIRPORT_ID", "on");
        formData.append("ORIGIN", "on");
        formData.append("DEST_AIRPORT_ID", "on");
        formData.append("DEST", "on");
        formData.append("AIRCRAFT_TYPE", "on");
        formData.append("MONTH", "on");
        //add more fields from the form if needed

        try {
            console.log(`Starting download for year ${year}...`);
            
            const response = await fetch(url, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                console.error(`Failed for year ${year}: ${response.statusText}`);
                return;
            }

            
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `data_${year}.zip`; // Change extension if needed
            document.body.appendChild(link);
            link.click();
            link.remove();
            console.log(`Downloaded data for ${year}`);
        } catch (error) {
            console.error(`Error downloading data for year ${year}:`, error);
        }
    }

    
    for (let year = 2000; year <= 2024; year++) {
        await downloadData(year);
        console.log(`Finished download for year ${year}, moving to next.`);
    }

    console.log("All downloads completed!");
})();
