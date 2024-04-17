

//type str = string; //type int = number; type bool = boolean;


//import {FieldValue} from "@google-cloud/firestore"
//import fs from "fs";


const YNAB_HOLDEM_ACCOUNT_ID = "b0b3f2b2-5067-4f57-a248-15fa97a18cf5"




async function Grab_Em(db:any, Firestore:any) {   return new Promise<any>(async (res, _rej)=> {

    const token = process.env.XEN_YNAB

    let promises:any[] = [

        Firestore.Retrieve(db, ["areas", "cats", "tags", "sources", "transactions"]),

        fetch(`https://api.ynab.com/v1/budgets/${YNAB_HOLDEM_ACCOUNT_ID}/accounts`, {
            method: 'GET',
            headers: { "Authorization": `Bearer ${token}` }
        })
    ]

    let r = await Promise.all(promises)

    let areas = r[0][0]
    let cats = r[0][1]
    let tags = r[0][2]
    let sources = r[0][3]
    let transactions = r[0][4]

    let ynab_accounts = (await r[1].json()).data.accounts

    areas.forEach((m:any)=> {
        const ynab_account = ynab_accounts.find((n:any)=> n.id === m.ynab_savings_id)
        m.ynab_savings = ynab_account.balance / 1000
    })

    res({areas, cats, tags, sources, transactions})
})}



async function YNAB_Sync_Categories(db:any, Firestore:any) {   return new Promise<any>(async (res, _rej)=> {

    const cats_with_deleteflag:{id:string, name:string}[] = []

    const ynab_cats_to_skip = ["Credit Card Payments", "Hidden Categories", "Internal Master Category"]

    const batch        = db.batch()

    const token = process.env.XEN_YNAB

    const r = await Firestore.Retrieve(db, ["areas", "cats"])

    const areas = r[0]
    const cats = r[1]

    const all_ynab_cats:{id:string,parentid:string|null}[] = []

    for(const a of areas) {

        const r = await fetch(`https://api.ynab.com/v1/budgets/${a.id}/categories`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        const rjson = await r.json()
        const ynab_cat_groups = rjson.data.category_groups

        for(const cg of ynab_cat_groups) {

            if (ynab_cats_to_skip.includes(cg.name)) continue

            let cat = cats.find((c:any)=> c.id === cg.id)
            
            if (cg.hidden || cg.deleted) {

                if (cat) {
                    cat.deleteflag = true
                    cat.ts = Math.floor(Date.now() / 1000)
                    batch.update(db.collection('cats').doc(cat.id), cat)

                    cats_with_deleteflag.push({id:cat.id, name:cat.name})
                }

            } else {

                all_ynab_cats.push({id:cg.id, parentid:null})

                if (!cat) {
                    cat = {
                        area: db.collection("areas").doc(a.id),
                        budget: null,
                        name: cg.name,
                        parent: null,
                        tags: null,
                        deleteflag: false,
                        ts: Math.floor(Date.now() / 1000)
                    }

                    const newcatdoc = db.collection('cats').doc(cg.id)
                    batch.set(newcatdoc, cat)

                } else {
                    cat.budget = null
                    cat.name = cg.name
                    cat.parent = null
                    cat.tags = null
                    cat.deleteflag = false
                    cat.ts = Math.floor(Date.now() / 1000)
                    batch.update(db.collection('cats').doc(cat.id), cat)
                }
            }

            for(const ccg of cg.categories) {
                
                let c = cats.find((m:any)=> m.id === ccg.id)
                let hashindex = ccg.name.lastIndexOf("#")
                let cattags = (hashindex > 0) ? ccg.name.slice(hashindex+1,ccg.name.length).split(",").map((c:string)=> parseInt(c)) : []
                let name = (hashindex > 0) ? ccg.name.slice(0,hashindex-1) : ccg.name

                if (ccg.hidden || ccg.deleted || cattags.length === 0) {

                    if (c) {
                        c.deleteflag = true
                        c.ts = Math.floor(Date.now() / 1000)
                        batch.update(db.collection('cats').doc(c.id), c)

                        cats_with_deleteflag.push({id:c.id, name:c.name})
                    }

                } else {

                    all_ynab_cats.push({id:ccg.id, parentid:cg.id})

                    if (!c) {
                        c = {
                            area: null,
                            budget: Math.floor(ccg.goal_target/1000),
                            name: name,
                            parent: db.collection("cats").doc(cg.id),
                            tags: cattags,
                            deleteflag: false,
                            ts: Math.floor(Date.now() / 1000)
                        }

                        const newcatdoc = db.collection('cats').doc(ccg.id)
                        batch.set(newcatdoc, c)

                    } else {
                        c.area = null
                        c.budget = Math.floor(ccg.goal_target/1000)
                        c.name = name
                        c.parent = db.collection("cats").doc(cg.id)
                        c.tags = cattags
                        c.deleteflag = false
                        c.ts = Math.floor(Date.now() / 1000)
                        batch.update(db.collection('cats').doc(c.id), c)
                    }
                }
            }
        }
    }

    for(const c of cats) {
        const has_ynab_corresponding = all_ynab_cats.find((m:any)=> m.id === c.id)

        if (!has_ynab_corresponding) {
            c.deleteflag = true
            c.ts = Math.floor(Date.now() / 1000)
            batch.update(db.collection('cats').doc(c.id), c)

            cats_with_deleteflag.push({id:c.id, name:c.name})
        }
    }

    await batch.commit().catch((err:any)=> console.error(err))

    res({cats_with_deleteflag})
})}




async function Get_YNAB_Raw_Transactions() {   return new Promise<any>(async (res, _rej)=> {

    const promises:any[] = []

    const token = process.env.XEN_YNAB

    promises.push(fetch(`https://api.ynab.com/v1/budgets/${YNAB_HOLDEM_ACCOUNT_ID}/transactions?type=uncategorized`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }))

    let r = await Promise.all(promises)

    const ynab_t = await r[0].json()

    const ynab_raw_transactions:any[] = []

    for(const nt of ynab_t.data.transactions) {

        if (nt.amount < 0) {
            const raw_transaction = {
                ynab_id: nt.id,
                amount: Math.round(Math.abs(nt.amount) / 1000),
                merchant: nt.payee_name,
                notes: nt.memo || "",
                source_id: nt.account_id,
                tags: nt.flag_name ? [nt.flag_name] : [],
                ts: (new Date(nt.date).getTime() / 1000)
            }
            ynab_raw_transactions.push(raw_transaction)
        }
    }

    res({ok:true, raw_transactions: ynab_raw_transactions})
})}




async function Save_Transactions_And_Delete_YNAB_Records(db:any, transactions:any) {   return new Promise<any>(async (res, rej)=> {

    const batch = db.batch()

    for(const nt of transactions) {

        if (nt.skipsave) continue

        const d = {
            amount: nt.amount,
            cat: db.collection("cats").doc(nt.cat_id),
            merchant: nt.merchant,
            notes: nt.notes,
            source: db.collection("sources").doc(nt.source_id),
            tags: [],
            ts: nt.ts
        }

        const docref = db.collection('transactions').doc()
        batch.set(docref, d)
    }

    batch.commit().catch((err:any)=> { rej(err); return })

    const token = process.env.XEN_YNAB

    transactions.forEach(async (t:any)=> {

        await fetch(`https://api.ynab.com/v1/budgets/${YNAB_HOLDEM_ACCOUNT_ID}/transactions/${t.ynab_id}`, {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
    })

    res({ok:true})
})}




const Finance = { Grab_Em, YNAB_Sync_Categories, Get_YNAB_Raw_Transactions, Save_Transactions_And_Delete_YNAB_Records };

export default Finance;
