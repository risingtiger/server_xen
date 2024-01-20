

//type str = string; //type int = number; type bool = boolean;




const changed_machines = [
    {"machineid":null,"storeid":null,"storename":"Winco - Happy Valley  ","storelatlon":null,"chip":"0165"}
];




async function GetMachinesForSync(res:any, db: any) {

    const machines_collection = db.collection("machines")
    const machines_snapshot = await machines_collection.get()
    const machines = machines_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

    const machines_for_sync = machines.filter((m: any) => {
        return (m.state.active === true && m.clientid !== "0000000"); 
    })

    res.status(200).send(JSON.stringify(machines_for_sync))
}




async function Sync(res:any, db: any) {

    const machines_collection = db.collection("machines")
    const machines_snapshot = await machines_collection.get()
    const machines = machines_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

    let batch        = db.batch()

    for(const changed_machine of changed_machines){

        const machine = machines.find((m: any) => m.chip === changed_machine.chip)

        if (machine) {
            const updateobj = {
                "store.name": changed_machine.storename,
            }

            batch.update(machines_collection.doc(machine.id), updateobj);
        }
    }

    await batch.commit().catch((er:any)=> console.error(er))

    res.status(200).send(JSON.stringify({return_str:"Done Syncing PWT Machines"}))
}




export { GetMachinesForSync, Sync };


