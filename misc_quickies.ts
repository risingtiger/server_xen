

import { General_Funcs_Get_All_Machines, } from "./generalfuncs.js";

// type str = string; 
// type int = number; 
// type bool = boolean;




async function Misc_Quicky_Show_Prop_Of_All_Machines(db: any, _secrets_client: any) {

  return new Promise<any>(async (res, _rej)=> {

    const machines = await General_Funcs_Get_All_Machines(db)

    const sorted_machines = machines.sort((a: any, b: any) => {
      return a.gps[2] - b.gps[2]
    })

    const mapped_str = sorted_machines.map((m: any) => {

      return `<p><span>store name: -- ${m.store.name}</span> <span>type: ${m.gps[2]}</span><span>lat: ${m.gps[0]}</span> <span>lon: ${m.gps[1]}</span> <span>date: ${(new Date(m.gps[3]*1000).toLocaleString())}</span></p>`
    })

    res({return_str: mapped_str.join('')})

  })
}




async function Misc_Get_Machines_To_Sync_With_PWTDATA(db: any, _secrets_client: any) {

    return new Promise<any>(async (res, _rej)=> {

        const machines = await General_Funcs_Get_All_Machines(db)

        const filtered_machines = machines.filter((m: any) => m.clientid !== "0000000" && m.state.active)

        const mapped_machines = filtered_machines.map((m: any) => {
            return {
                chip: m.chip,
                clientid: m.clientid,
                machineid: m.machineid,
                storeid: m.store.id,
                storename: m.store.name,
                storelatlon: m.store.latlon,
            }
        })

        res(mapped_machines)

    })
}




async function Misc_Update_Machines_To_Sync_With_PWTDATA(db: any, updated_machines:any[], _secrets_client: any) {

    return new Promise<any>(async (res, _rej)=> {

        debugger
        const machines_collection = db.collection("machines")

        const machines_snapshot = await machines_collection.get()

        const allmachines = machines_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        let batch        = db.batch()

        let count = 0

        for (const updatedmachine of updated_machines) {

            const machine = allmachines.find((m: any) => m.chip === updatedmachine.chip)

            if (!machine){
                continue
            }

            count++

            const obj = {}

            if (updatedmachine.mchId) obj["mchId"] = updatedmachine.mchId
            if (updatedmachine.storeid) obj["storeid"] = updatedmachine.storeid
            if (updatedmachine.storename) obj["storename"] = updatedmachine.storename
            if (updatedmachine.storelatlon) obj["latlon"] = updatedmachine.storelatlon

            if (Object.keys(obj).length === 0) {
                continue
            }

            //batch.update(machines_collection.doc(machine.id), updatedmachine) 
        }

        //await batch.commit().catch((er:any)=> console.error(er))

        console.info("count ", count)

        res(1)
    })
}





export { Misc_Quicky_Show_Prop_Of_All_Machines, Misc_Get_Machines_To_Sync_With_PWTDATA, Misc_Update_Machines_To_Sync_With_PWTDATA };


