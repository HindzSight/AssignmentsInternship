import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Create a session to persist cookies and headers
session = requests.Session()

# Set headers to mimic a browser
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
}
session.headers.update(headers)

# Send a GET request
url = "https://www.indiacode.nic.in/handle/123456789/1362/browse?type=actno&order=ASC&rpp=85&offset=100"
response = session.get(url)

# Check if the response contains content or shows an error
if response.status_code == 200:
    # Parse the page
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find all elements with the specified class
    panels = soup.find_all(class_="panel panel-primary")
    
    # Create a directory to save the PDFs
    os.makedirs('downloaded_pdfs', exist_ok=True)

    # Loop through each panel to find links to PDF files
    for panel in panels:
        # Find all anchor tags within the panel
        links = panel.find_all('a', href=True)
        
        for link in links:
            # Construct the full URL of the PDF
            pdf_url = urljoin(url, link['href'])
            print(f"Downloading: {pdf_url}")
            
            # Send a GET request to download the PDF
            pdf_response = session.get(pdf_url)
            if pdf_response.status_code == 200:
                pdf_filename = os.path.join('downloaded_pdfs', os.path.basename(pdf_url))
                
                # Save the PDF
                with open(pdf_filename, 'wb') as f:
                    f.write(pdf_response.content)
                print(f"Downloaded: {pdf_filename}")
            else:
                print(f"Failed to download {pdf_url} - Status code: {pdf_response.status_code}")
else:
    print(f"Failed to retrieve the page - Status code: {response.status_code}")
