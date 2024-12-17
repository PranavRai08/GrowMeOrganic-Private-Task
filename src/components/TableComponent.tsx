import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Checkbox } from 'primereact/checkbox';
import { ChevronDown } from 'react-feather';

interface Artwork {
  id: number;
  title: string;
  category_titles: string;
}

const TableComponent: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectCount, setSelectCount] = useState<number>(0);

  const overlayPanelRef = useRef<OverlayPanel>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`); 
        const data = await response.json();

        const mappedData: Artwork[] = data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          category_titles: item.category_titles ? item.category_titles.join(", ") : "N/A",
        }));

        setArtworks(mappedData);
        setTotalRecords(data.pagination.total);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const onPageChange = (event: any) => {
    setPage(event.page + 1);
  };

  const onChevronClick = (event: React.MouseEvent) => {
    overlayPanelRef.current?.toggle(event);
  };

  const onSubmitSelection = () => {
    if (selectCount > 0) {
      const rowsToSelect = artworks.slice(0, selectCount);
      setSelectedArtworks(rowsToSelect); 
      overlayPanelRef.current?.hide();
    }
  };

  const selectAllHeader = () => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Checkbox
        onChange={(e) => setSelectedArtworks(e.checked ? [...artworks] : [])} 
        checked={selectedArtworks.length === artworks.length && artworks.length > 0} 
      />
      <span style={{ marginLeft: "5px" }}>Select All</span>
      <ChevronDown
        style={{ marginLeft: "5px", cursor: "pointer" }}
        onClick={onChevronClick}
      />
    </div>
  );

  return (
    <div>
      <h2>Table</h2>
      <DataTable
        value={artworks}
        paginator
        rows={10}
        totalRecords={totalRecords}
        lazy
        first={(page - 1) * 10}
        onPage={onPageChange}
        loading={loading}
        selectionMode="multiple"
        selection={selectedArtworks} 
        onSelectionChange={(e) => setSelectedArtworks(e.value)} 
        dataKey="id" 
      >
        <Column header={selectAllHeader} selectionMode="multiple" style={{ width: "3em" }} />
        <Column field="id" header="Code" style={{ width: "10em", paddingRight: "2em" }} />
        <Column field="title" header="Name" />
        <Column field="category_titles" header="Category" />
      </DataTable>
      <OverlayPanel ref={overlayPanelRef}>
        <div>
          <h5>Select Rows</h5>
          <InputText
            type="number"
            placeholder="Number of rows..."
            value={selectCount.toString()}
            onChange={(e) => setSelectCount(parseInt(e.target.value) || 0)}
          />
          <Button
            label="Submit"
            className="p-button-primary"
            style={{ marginTop: "10px" }}
            onClick={onSubmitSelection}
          />
        </div>
      </OverlayPanel>
    </div>
  );
};

export default TableComponent;
