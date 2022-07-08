import * as React from 'react';
import {DataGrid} from '@mui/x-data-grid'
import { TextField,Button } from '@mui/material';
const { ipcRenderer } = window.require('electron');

let idCounter = 0;
const columns = [
    {field: 'col1', flex:0.5},
    {field: 'col2', flex:0.3},
    {field: 'col3', flex:1},
    {field: 'col4', flex:1},
    {field: 'col5', flex:1}
]
const Crawl = () => {
    const ref = React.useRef();
    const pathRef = React.useRef();
    const [rows, setRows] = React.useState([]);
    const getOnClick = () => {
        if (ref.current.value){
            ipcRenderer.send('Crawl', [ref.current.value, pathRef.current.value])
        }
    }
    const pathSelectOnClick = () => {
        ipcRenderer.send('Path')
    }
    React.useEffect(() => {
        ipcRenderer.on('Crawl', (event, arg) => {
            setRows(arg)
        })
        ipcRenderer.on('Path', (event, arg) => {
            pathRef.current.value = arg
        })
    },[])
    return (
        <>
            <div style={{display:'flex'}}>
                <TextField inputRef={ref} rows={4} multiline placeholder="url" sx={{width: '30%'}}/>
                <div style={{justifyContent:'space-between', flexDirection: 'column', display:'flex', alignItems: 'flex-start'}}>
                    <Button onClick={getOnClick} size='large'>get</Button>
                    <div style={{display:'flex'}}>
                        <TextField inputRef={pathRef} placeholder="FilePath" sx={{
                            width: 400,
                            '> .MuiOutlinedInput-root': {
                                width:400
                            }
                        }}/>
                        <Button onClick={pathSelectOnClick} size='large'>pathSelect</Button>
                    </div>
                </div>
            </div>
            <DataGrid columns={columns} rows={rows} autoHeight rowHeight={300} sx={{                
                '& .MuiDataGrid-cell': {
                    height:300,
                    whiteSpace: 'pre-wrap',
                    '> .MuiDataGrid-cellContent': {
                        maxHeight: 'inherit',
                        overflowY: 'auto'
                    }
                  }
            }}/>
        </>
    )
}

export default Crawl