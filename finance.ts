

//type str = string; //type int = number; type bool = boolean;


//import {FieldValue} from "@google-cloud/firestore"
//import fs from "fs";


async function Sync_Latest_GSheets(db:any, sheets:any) {   return new Promise<any>(async (res, _rej)=> {

    const getRows = await sheets.spreadsheets.values.get({
        spreadsheetId: '1cg95k0KGkn16E07PQcSw7g8T9ssmFBu_iQ_krJpXp8U',
        range: "Transactions!A3:O47",
    })

    const rows = getRows.data.values

    const transactions_gsheets:any[] = []

    rows.forEach((row:any[]) => {
        const [_status, date, description, _category, amount_str, account, _account_num, institution, _currency, _channel, _sheetsync_category, _sheetsync_category_sub, full_description, id] = row

        let   amount = parseFloat(amount_str.replace("$", ""))

        if (isNaN(amount) || amount > 0) return

        amount = Math.abs(amount)

        const ts = Math.floor(new Date(date).getTime() / 1000)

        let sourcename = ""

        if      (institution.toLowerCase().includes("barclay"))   sourcename = "barclay"
        else if (institution.toLowerCase().includes("chase"))     sourcename = "chase"
        else if (institution.toLowerCase().includes("mountain america") && account.toLowerCase().includes("checking"))  sourcename = "macuc"
        else if (institution.toLowerCase().includes("mountain america") && account.toLowerCase().includes("visa"))      sourcename = "macuv"

        const long_desc = full_description
        const short_desc = description

        const transaction = {sheetsid:id, sourcename, long_desc, short_desc, amount, ts, processed:false }

        transactions_gsheets.push(transaction)
    })

    const transactions_raw_docs = await db.collection('transactions_raw').orderBy('ts', 'desc').limit(55).get()
    const transactions_raw = transactions_raw_docs.docs.map((m: any) => ({ id: m.id, ...m.data() }));

    const new_raw_transactions:any[] = []

    for (const trgsh of transactions_gsheets) {
        let found = transactions_raw.find((m: any) => m.sheetsid === trgsh.sheetsid)
        if (!found) new_raw_transactions.push(trgsh)
    }

    if (new_raw_transactions.length > 0) {
        const batch = db.batch()

        for (const t of new_raw_transactions) {
            const docref = db.collection('transactions_raw').doc()
            batch.set(docref, t)
        }

        batch.commit().catch((err:any)=> console.error(err))
    }

    res({})
})}




async function Get_Latest_Raw_Transactions(db:any) {   return new Promise<any>(async (res, _rej)=> {

    const transactions_raw_docs = await db.collection('transactions_raw').where('processed', '==', false).limit(12).get()
    const transactions_raw = transactions_raw_docs.docs.map((m: any) => ({ id: m.id, ...m.data() }));

    res(transactions_raw)
})}




async function Save_Raw_Transaction(db:any, body:any) {   return new Promise<any>(async (res, _rej)=> {

    const batch = db.batch()

    const docref = db.collection('transactions_raw').doc(body.transaction_raw_id)

    batch.update(docref, { processed: true })

    for(const nt of body.newtransactions) {
        const docref = db.collection('transactions').doc()

        const newtransaction = {
            amount: nt.amount,
            cat: db.collection("cats").doc(nt.catid),
            merchant: nt.merchant,
            notes: nt.notes,
            source: db.collection("sources").doc(nt.sourceid),
            tags: [],
            ts: nt.ts
        }

        newtransaction.tags = nt.tagids.map((m:any)=> db.collection("tags").doc(m))

        batch.set(docref, newtransaction)
    }
    
    batch.commit().catch((err:any)=> console.error(err))

    res({})
})}




const Finance = { Sync_Latest_GSheets, Get_Latest_Raw_Transactions, Save_Raw_Transaction };

export default Finance;
