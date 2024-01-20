

//type str = string; //type int = number; type bool = boolean;

//import fetch from "node-fetch";
import {FieldValue} from "@google-cloud/firestore"
//import fs from "fs";




const Admin_Firestore_Update_Collection_Docs = async (db: any) => {

    return new Promise<any>(async (res, _rej)=> {

        const machines_collection = db.collection("machines")
        const machines_snapshot = await machines_collection.get()
        const machines = machines_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        let batch        = db.batch()

        for (const machine of machines) {

            const machineid = machine.mchId.padStart(7, "0")
            const storeid = machine.store.id.padStart(7, "0")

            const updateobj = {
                machineid,
                "store.id":storeid,
            }

            console.log(updateobj);
            batch.update(machines_collection.doc(machine.id), updateobj);
        }

        await batch.commit().catch((er:any)=> console.error(er))

        res({return_str:"Done Updating Collection Docs"})
  })

}




const Update_Collection_Docs_arch = async (db: any) => {

    return new Promise<any>(async (res, _rej)=> {

        const pers_cats_collection = db.collection("pers_cats")
        const rtm_cats_collection = db.collection("rtm_cats")

        const pers_sources_collection = db.collection("pers_sources")
        const rtm_sources_collection = db.collection("rtm_sources")

        const pers_transactions_collection = db.collection("pers_transactions")
        const rtm_transactions_collection = db.collection("rtm_transactions")

        const old_transactions_collection = db.collection("transaction")




        const pers_cats_snapshot = await pers_cats_collection.get()
        const pers_cats_docs = pers_cats_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        const rtm_cats_snapshot = await rtm_cats_collection.get()
        const rtm_cats_docs = rtm_cats_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        const pers_sources_snapshot = await pers_sources_collection.get()
        const pers_sources_docs = pers_sources_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        const rtm_sources_snapshot = await rtm_sources_collection.get()
        const rtm_sources_docs = rtm_sources_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        const old_transactions_snapshot = await old_transactions_collection.get()
        const old_transactions_docs = old_transactions_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        /*
        const pers_transactions_snapshot = await pers_transactions_collection.get()
        const pers_transactions_docs = pers_transactions_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        const rtm_transactions_snapshot = await rtm_transactions_collection.get()
        const rtm_transactions_docs = rtm_transactions_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        */

        let batch        = db.batch()

        let pers_cats_docs_ids = pers_cats_docs.map((m: any) => m.id)
        let rtm_cats_docs_ids = rtm_cats_docs.map((m: any) => m.id)

        let pers_sources_docs_ids = pers_sources_docs.map((m: any) => m.id)
        let rtm_sources_docs_ids = rtm_sources_docs.map((m: any) => m.id)

        let pers_count = 0;
        let rtm_count = 0;
        let total_count = 0;

        const newdocs = []
        for (let doc of old_transactions_docs) {

            const area = pers_cats_docs_ids.includes(doc.cat.id) ? "pers" : rtm_cats_docs_ids.includes(doc.cat.id) ? "rtm" : null

            delete doc.id
            doc.tags = []

            if (area === null){
                console.info("transaction doesnt have a matching cat in either pers or rtm")
                continue
            } else if (area === "pers"){
                doc.cat = pers_cats_docs.find((m: any) => m.id === doc.cat.id).id   
                doc.source = pers_sources_docs.find((m: any) => m.id === doc.source.id)?.id || "ZD2kREyTHdjC2rhxWeBL"   
                const newdoc = pers_transactions_collection.doc()
                batch.set(newdoc, doc)
                pers_count++
            } else if (area === "rtm"){
                doc.cat = rtm_cats_docs.find((m: any) => m.id === doc.cat.id).id
                doc.source = rtm_sources_docs.find((m: any) => m.id === doc.source.id)?.id || "ZD2kREyTHdjC2rhxWeBL"
                const newdoc = rtm_transactions_collection.doc()
                batch.set(newdoc, doc)
                rtm_count++
            }

            total_count++
            newdocs.push(doc) 


            /*
            if (array.includes(doc.parent.id)){
                const newdoc = rtm_cats_collection.doc(doc.id)
                batch.set(newdoc, {
                    modts: Math.round(Date.now() / 1000),
                    name: doc.name,
                    parent: doc.parent.id,
                })
            }
            */

            //let mod_doc = collection.doc(doc.id)

            //let mod_obj = {
            //   "modts": 1697302721,
            //}

            /*
            const pers_newdoc = pers_sources_collection.doc(doc.id)
            const rtm_newdoc = rtm_sources_collection.doc(doc.id)

            batch.set(pers_newdoc, {
                modts: Math.round(Date.now() / 1000),
                name: doc.name,
            })
            batch.set(rtm_newdoc, {
                modts: Math.round(Date.now() / 1000),
                name: doc.name,
            })
            */

            /*
            if (doc.parent?.id){
                const newdoc = pers_cats_collection.doc(doc.id)

                batch.set(newdoc, {
                    modts: Math.round(Date.now() / 1000),
                    name: doc.name,
                    parent: doc.parent.id,
                })
            }
            */

            //x += `"${doc.id}", `
        }

        //console.info(x)

        //fs.writeFileSync("/Users/dave/Desktop/pers_cat.json", JSON.stringify(x, null,1))

        await batch.commit().catch((er:any)=> console.error(er))



        res({return_str:"Done Updating Collection Docs"})

  })

}




const Admin_Firestore_Misc_Get = async (db: any) => {

    return new Promise<any>(async (res, _rej)=> {
        
        const machines_collection = db.collection("machines")

        const machines_snapshot = await machines_collection.get()

        const machines = machines_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        let objarray = []

        for(const machine of machines){

            if (machine.mchId !== "0000" && machine.clientid === "0000000") {
                objarray.push({
                    chip: machine.chip,
                    mchId: machine.mchId,
                    storeid: machine.store.id
                })
            }
        }

        console.log(JSON.stringify(objarray, null, 2))

        res(objarray)
    })
}




export { Admin_Firestore_Update_Collection_Docs, Admin_Firestore_Misc_Get };


