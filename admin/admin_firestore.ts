

//type str = string; //type int = number; type bool = boolean;

import {FieldValue} from "@google-cloud/firestore"
//import fs from "fs";




const Misc_Update = async (db: any) => {

    return new Promise<any>(async (res, _rej)=> {

        const cats_collection = db.collection("cats")
        const cats_snapshot = await cats_collection.get()
        const cats = cats_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        let batch        = db.batch()

        for (const cat of cats) {

            const updateobj = {
                bucket: {
                    val: 120,
                    diffs: [2,4,-7]
                },
            }

            batch.update(cats_collection.doc(cat.id), updateobj);
        }

        await batch.commit().catch((er:any)=> console.error(er))

        res({return_str:"Done Misc Update"})
  })

}




const Misc_Get = async (db: any) => {

    return new Promise<any>(async (res, _rej)=> {
        
        const cats_collection = db.collection("cats")

        const cats_snapshot = await cats_collection.get()

        const cats = cats_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        let objarray:any[] = []

        for(const cat of cats){

            if (cat.name.includes("ya")) {
                objarray.push({
                    name: "chipaya",
                })
            }
        }

        console.log(JSON.stringify(objarray, null, 2))

        res(objarray)
    })
}




const Admin_Firestore = { Misc_Update, Misc_Get };

export default Admin_Firestore;
