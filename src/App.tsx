import './App.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { DataTable} from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { OverlayPanel } from 'primereact/overlaypanel';

const App = () => {
    const [artworks, setArtworks] = useState([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [first, setFirst] = useState(0);
    const [rows] = useState(12);
    const [rowsToSelect, setRowsToSelect] = useState('0');
    const op = useRef<OverlayPanel>(null);

    const fetchArtworks = async (page: number) => {
        setLoading(true);
        const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
        setArtworks(response.data.data);
        setTotalRecords(response.data.pagination.total);
        setLoading(false);
    };

    useEffect(() => {
        fetchArtworks(1);
    }, []);

    const onPageChange = (event: any) => {
        const page = event.page + 1; // PrimeReact DataTable is zero-based, API is one-based
        setFirst(event.first);
        fetchArtworks(page);
    };

    const onSelectionChange = (e: any) => {
        setSelectedRows(e.value);
    };

    const handleSubmit = async () => {
        const rowsToSelectNum = parseInt(rowsToSelect, 10);
        if (!isNaN(rowsToSelectNum) && rowsToSelectNum > 0) {
            let newSelectedRows: any[] = [...selectedRows];

            // Calculate the total rows we need to select
            let rowsNeeded = rowsToSelectNum;
            let currentPage = 1;
            
            while (rowsNeeded > 0) {
                // Fetch the page data if needed
                if (newSelectedRows.length < rowsToSelectNum) {
                    setLoading(true);
                    const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${currentPage}`);
                    const pageData = response.data.data;
                    
                    // Add rows from this page to our selection
                    const rowsFromPage = pageData.slice(0, rowsNeeded);
                    newSelectedRows = [...newSelectedRows, ...rowsFromPage];
                    rowsNeeded -= rowsFromPage.length;

                    setLoading(false);
                }
                currentPage++;
            }

            setSelectedRows(newSelectedRows.slice(0, rowsToSelectNum)); // Trim to the exact number requested
        }
        if (op.current) {
            op.current.hide(); // Hide the OverlayPanel after submission
        }
    };

    return (
        <div>
            <DataTable value={artworks} paginator rows={rows} totalRecords={totalRecords} selectionMode="multiple"
                       lazy first={first} onPage={onPageChange} loading={loading}
                       selection={selectedRows} onSelectionChange={onSelectionChange}
                       dataKey="id">
                <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                <Column field="title" header={
                    <div>
                        <i className="pi pi-chevron-down" style={{ marginLeft: '5px', cursor: 'pointer' }} 
                           onClick={(e) => op.current?.toggle(e)}></i>
                        <OverlayPanel ref={op}>
                            <div>
                                <label>Enter Rows:</label>
                                <input type="number" value={rowsToSelect} onChange={(e) => setRowsToSelect(e.target.value)} />
                                <button onClick={handleSubmit}>Submit</button>
                            </div>
                        </OverlayPanel>
                        Title 
                    </div>
                }></Column>
                <Column field="place_of_origin" header="Place of Origin"></Column>
                <Column field="artist_display" header="Artist"></Column>
                <Column field="inscriptions" header="Inscriptions"></Column>
                <Column field="date_start" header="Date Start"></Column>
                <Column field="date_end" header="Date End"></Column>
            </DataTable>
        </div>
    );
};

export default App;
