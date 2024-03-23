

//type bool  = boolean; type str  = string; type int  = number;

type SERVER_MAINS_T = { app:any, db:any, sheets:any, notifications:any, sse:any, appversion:number, validate_request:(res:any, req:any)=>Promise<string> }
const SERVER_MAINS:SERVER_MAINS_T = { app:{}, db:{}, sheets:{}, notifications:{}, sse:{}, appversion: 0, validate_request: (_req:any) => Promise.resolve("") }

import Finance from "./finance.js"
import Admin_Firestore from "./admin/admin_firestore.js"




function Set_Server_Mains(app:any, db:any, sheets:any, notifications:any, sse:any, appversion:number, validate_request:any) {
    SERVER_MAINS.app = app, 
    SERVER_MAINS.db = db
    SERVER_MAINS.sheets = sheets
    SERVER_MAINS.notifications = notifications
    SERVER_MAINS.sse = sse
    SERVER_MAINS.appversion = appversion
    SERVER_MAINS.validate_request = validate_request
}




function Set_Routes() {

    SERVER_MAINS.app.get( '/api/xen/finance/sync_latest_gsheet',                             finance_sync_latest_gsheets)       
    SERVER_MAINS.app.get( '/api/xen/finance/get_latest_raw_transactions',                    finance_get_latest_raw_transactions)       
    SERVER_MAINS.app.post( '/api/xen/finance/save_raw_transaction',                          finance_save_raw_transaction)       

    SERVER_MAINS.app.get( '/api/xen/admin/firestore_misc_update',                            admin_firestore_misc_update)
}




// -- ROUTE HANDLERS --

async function finance_sync_latest_gsheets(req:any, res:any) {
    
    if (! await SERVER_MAINS.validate_request(res, req)) return 

    await Finance.Sync_Latest_GSheets(SERVER_MAINS.db, SERVER_MAINS.sheets)

    res.status(200).send(JSON.stringify({}))
}




async function finance_get_latest_raw_transactions(req:any, res:any) {
    
    if (! await SERVER_MAINS.validate_request(res, req)) return 

    const transactions = await Finance.Get_Latest_Raw_Transactions(SERVER_MAINS.db)
    res.status(200).send(JSON.stringify(transactions))
}




async function finance_save_raw_transaction(req:any, res:any) {
    
    if (! await SERVER_MAINS.validate_request(res, req)) return 

    const d = req.body

    Finance.Save_Raw_Transaction(SERVER_MAINS.db, d)
    res.status(200).send(JSON.stringify({}))
}




async function admin_firestore_misc_update(req:any, res:any) {
    
    if (! await SERVER_MAINS.validate_request(res, req)) return 

    const results = await Admin_Firestore.Misc_Update(SERVER_MAINS.db)
    res.status(200).send(JSON.stringify(results))
}












const PROJECTID   = "xenition"
const KEYJSONFILE = "/Users/dave/.ssh/xenition_local.json"
const SHEETS_KEYJSONFILE = "/Users/dave/.ssh/xenition-sheets-244e0733ca64.json"
const IDENTITY_PLATFORM_API = "AIzaSyDfXcwqyiRGGO6pMBsG8CvNEtDIhdspKRI"

export default { PROJECTID, KEYJSONFILE, IDENTITY_PLATFORM_API, SHEETS_KEYJSONFILE, Set_Server_Mains, Set_Routes};


