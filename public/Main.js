const {app, BrowserWindow, ipcMain, net, dialog} = require('electron');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const url = require('url');
const xlsx = require('xlsx');

function createWindow() {
    /*
    * 넓이 1920에 높이 1080의 FHD 풀스크린 앱을 실행시킵니다.
    * */
    const win = new BrowserWindow({
        width:1920,
        height:1080,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.setMenu(null);
    win.webContents.on('dom-ready', () => {
        win.webContents.send('Path', app.getPath('desktop') + '\\Crawl.xlsx');
    })
    /*
    * ELECTRON_START_URL을 직접 제공할경우 해당 URL을 로드합니다.
    * 만일 URL을 따로 지정하지 않을경우 (프로덕션빌드) React 앱이
    * 빌드되는 build 폴더의 index.html 파일을 로드합니다.
    * */      
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });

    /*
    * startUrl에 배정되는 url을 맨 위에서 생성한 BrowserWindow에서 실행시킵니다.
    * */
    win.loadURL(startUrl);
    

}

app.on('ready', createWindow);
const rows = []
ipcMain.on('Crawl', (event, arg) => {    
    Promise.all(arg[0].split("\n").reduce((acc, keyword, i) => {
        if (keyword){
            acc.push(getInfo(keyword, i))            
        }        
        return acc
    },[])).then((rows) => {
        event.sender.send("Crawl", rows)
        const book = xlsx.utils.book_new();
        const sheet = xlsx.utils.json_to_sheet(rows,{header:["col1", "col2", "col3", "col4","col5"], skipHeader:true})        
        xlsx.utils.book_append_sheet(book, sheet);
        try{
            xlsx.writeFile(book, arg[1]);            
        }catch(err){
            dialog.showErrorBox('Error', err.message)
        }
    })   
});
ipcMain.on('Path', (event, arg) => {
    dialog.showSaveDialog(null, {defaultPath: app.getPath('desktop') + '\\Crawl.xlsx'}).then((path) => {
        if (!path.canceled){
            event.sender.send('Path', path.filePath)
        }        
    }).catch((err) => {
        event.sender.send('Path', err)
    })
})
const getInfo = (keyword, i) => new Promise((resolve, reject) => {
    const row = {id:0, col1: "", col2: "", col3: "", col4: "", col5: ""}
    let idx = 1;
    let ur = encodeURI(`https://browse.gmarket.co.kr/search?keyword=${keyword}&p=${idx}`);
    console.log("1");
    axios.get(ur).then((response) => {
        const $ = cheerio.load(response.data);
        console.log(response.data);
        console.log($('div').eq(0));
    //     pid = response.request.path.match(/(?<=\/.*\/)\w*/)[0]
    //     axios.get(`https://api.bunjang.co.kr/api/1/product/${pid}/detail_info.json?version=4`).then((response) => {             
    //         row.id = i
    //         resolve(row)                        
    //     }).catch((err) => {
    //         row.id = i
    //         resolve(row)
    //     })
    }).catch((err) => {
        row.id = i
        resolve(row)        
    })
})