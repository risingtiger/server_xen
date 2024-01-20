

type str  = string; type int  = number; //type bool  = boolean; 

//declare var Gen_Utility_Get_Secret: (secret_name:str) => Promise<void>;

//import {appendFileSync, existsSync, writeFileSync} from "fs";
import Particle from "../particle.js";


const FILENAME = "./statuses_stats.txt"


type Stats_T = {
  particle_chips_count: int,
  particle_llc_chips_count: int
  particle_east_chips_count: int
  particle_west_chips_count: int
  machines_count: int
}




async function Get_All(req:any, res:any) { return new Promise(async (res, _rej)=> {

    res.setHeader('Appversion', APPVERSION);
    res.status(200).send(JSON.stringify(stats))

    /*
    const particle_chips = await General_Funcs_Get_Particle_Chips_Of_All_Accounts(secrets_client) 
    const machines = await General_Funcs_Get_All_Machines(db)

    const stats: Stats_T = {
      particle_chips_count: particle_chips.llc.length + particle_chips.east.length + particle_chips.west.length,
      particle_llc_chips_count: particle_chips.llc.length,
      particle_east_chips_count: particle_chips.east.length,
      particle_west_chips_count: particle_chips.west.length,
      machines_count: machines.length
    }

    res(stats)

  })

    */
})}



function Stats_Get_All_MachineStatusStats(db:any) {   return new Promise(async (res, _rej)=> {

    const machines = await General_Funcs_Get_All_Machines(db)

    let index = 0

    writeFileSync(FILENAME, `chip,mchId,storename,statuscount\n`)

    next()


    async function next() {

        const m = machines[index]

        const statuses_stat = await Stats_Get_MachineStatusStats(db, m.id) as any

        appendFileSync(FILENAME, `${m.chip},${m.mchId},${m.store.name},${statuses_stat.count}\n`)
        index++

        if (index < machines.length-1) { 
            setTimeout(async ()=> {   next();   }, 1200)
        }

        else { 
            res({job: "done"}) 
        }
    }
})}




function Stats_Get_MachineStatusStats(db:any, machine_id:str) {   return new Promise(async (res, _rej)=> {

    const machine_statuses = db.collection(`machines/${machine_id}/statuses`)

    const count_snapshot = await machine_statuses.count().get()

    return res({count: count_snapshot.data().count})
})}








const Stats = { Get_All };
export default Stats;



