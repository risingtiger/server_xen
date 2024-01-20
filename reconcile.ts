

import { General_Funcs_Get_All_Machines, General_Funcs_Get_Particle_Chips_Of_All_Accounts } from "./generalfuncs.js";
import fetch from "node-fetch";

type str = string; 
type int = number; 
type bool = boolean;

type Reconcile_Results_T = {
  return_str: str
}



async function Reconcile(db: any, secrets_client: any) {

    return new Promise<Reconcile_Results_T>(async (res, _rej)=> {

        const particle_chips = await General_Funcs_Get_Particle_Chips_Of_All_Accounts(secrets_client)
        const machines = await General_Funcs_Get_All_Machines(db)

        const all_particle_chips = [...particle_chips.llc, ...particle_chips.east, ...particle_chips.west]

        let return_str = ""

        machines.forEach((m: any) => {

            const particle_chip =  all_particle_chips.find(d => d.id == m.particle.id)
            const particle_account_and_chip_type_from_product_id = match_particle_product_to_account_and_chip_type(m.particle.product)

            if (!particle_chip) {
                return_str += `<p>firestore machine ${m.id} doesn't have matching particle device</p>`
            }

            else {
                const is_particle_id_duplicate = machines.filter(mm => (mm !== m && mm.particle.id === m.particle.id))
                const is_mchId_duplicate = machines.filter(mm => (mm !== m && (mm.mchId !== "0000" && mm.mchId === m.mchId) ))
                const is_chip_duplicate = machines.filter(mm => (mm !== m && mm.chip === m.chip ))
                const is_store_id_duplicate = machines.filter(mm => (mm !== m && (mm.store.id !== "0000" && mm.store.id === m.store.id) ))
                const is_clientid_duplicate = machines.filter(mm => (mm !== m && (mm.clientid !== "0000000" && mm.clientid === m.clientid) ))
                const is_missing_mchId = m.clientid !== "0000000" && m.mchId === "0000"
                const is_missing_storeid = m.clientid !== "0000000" && m.store.id === "0000"
                const is_missing_latlon = m.clientid !== "0000000" && (m.store.lat === 0 || m.store.lon === 0)

                const is_particle_serial_wrong = m.particle.serial !== particle_chip.serial_number
                const is_particle_product_wrong = m.particle.product !== particle_chip.product_id
                const is_particle_account_wrong = get_is_particle_account_wrong(m.particle.account, particle_account_and_chip_type_from_product_id?.account)
                const is_particle_name_wrong = "pwt_"+m.chip !== particle_chip.name
                const is_particle_not_in_product = particle_chip.product_id === particle_chip.platform_id


                if (is_particle_id_duplicate.length > 0) {
                    return_str += `<p>firestore chip ${m.chip} has duplicate particle id ${m.particle.id}</p>`
                }

                if (is_mchId_duplicate.length > 0) {
                    return_str += `<p>firestore chip ${m.chip} has duplicate mchId ${m.mchId}</p>`
                }

                if (is_chip_duplicate.length > 0) {
                    return_str += `<p>firestore chip ${m.chip} has duplicate chip ${m.chip}</p>`
                }

                if (is_store_id_duplicate.length > 0) {
                    return_str += `<p>firestore chip ${m.chip} has duplicate store id ${m.store.id}</p>`
                }

                if (is_clientid_duplicate.length > 0) {
                    return_str += `<p>firestore chip ${m.chip} has duplicate clientid ${m.clientid}</p>`
                }

                if (is_missing_mchId) {
                    return_str += `<p>firestore chip ${m.chip} missing mchId</p>`
                }

                if (is_missing_storeid) {
                    return_str += `<p>firestore chip ${m.chip} missing store id</p>`
                }

                if (is_missing_latlon) {
                    return_str += `<p>firestore chip ${m.chip} missing lat lon</p>`
                }

                if (is_particle_serial_wrong) {
                    return_str += `<p>firestore chip ${m.chip} has wrong particle serial</p>`
                }

                if (is_particle_product_wrong) {
                    return_str += `<p>firestore chip ${m.chip} has wrong particle product</p>`
                }

                if (is_particle_account_wrong) {
                    return_str += `<p>firestore chip ${m.chip} has wrong particle account</p>`
                }

                if (is_particle_name_wrong) {
                    return_str += `<p>particle chip name ${particle_chip.name} doesnt match firestore machine chip ${m.chip}</p>`
                }

                if (is_particle_not_in_product) {
                    return_str += `<p>particle chip ${particle_chip.id} not in product</p>`
                }
            }
        })

        all_particle_chips.forEach((p: any) => {
            if(!machines.find(mm => mm.particle.id == p.id)) {
                return_str += `<p>particle chip ${p.id} of ${p.account} doesn't have matching firestore machine</p>`
            }
        })

        res({return_str})
    })
}




function match_particle_product_to_account_and_chip_type(product_id:int) : { account:str, chip_type:str}|null {

  switch (product_id) {

    case 11723:
      return {account: 'llc', chip_type: 'boron'}
    case 11724:
      return {account: 'llc', chip_type: 'bseries'}

    case 20405:
      return {account: 'east', chip_type: 'boron'}
    case 20406:
      return {account: 'east', chip_type: 'bseries'}

    case 20568:
      return {account: 'west', chip_type: 'boron'}
    case 20567:
      return {account: 'west', chip_type: 'bseries'}
  }

  return null

}




function get_is_particle_account_wrong(account_email:str, account_name) : bool {

  if (account_email === "accounts_risingtiger_com") {
    return account_name !== "llc"
  }

  if (account_email === "rfs_risingtiger_com") {
    return account_name !== "east"
  }

  if (account_email === "west_pwt_risingtiger_com") {
    return account_name !== "west"
  }

  else {
    return true
  }

}







export { Reconcile };


