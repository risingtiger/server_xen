

type bool  = boolean;
//type str  = string;
type int  = number;

import { General_Funcs_Get_All_Machines } from "./generalfuncs.js";




const Is_Chip_At_Store = (db:any) => {

    return new Promise(async (res, _rej)=> {
    
        const all_machines = await General_Funcs_Get_All_Machines(db)

        for (const machine of all_machines) {

            const is_at_expected_location = get_is_at_expected_location(machine.gps, machine.storegps)

            console.log(machine.chip, " ", is_at_expected_location)
        }

        res(true)
    })
} 




function get_is_at_expected_location(gps:int[], storegps:int[]|null) : bool|null {

    const mile_in_gps = 0.000176

    if (gps[0] === 0 || gps[1] === 0 || storegps === null || storegps[0] === 0 || storegps[1] === 0) {
        return null
    }

    const d = ( (gps[1]-gps[0])**2 + (storegps[1]-storegps[0])**2 )
    const distance = Math.sqrt( Math.abs(d) )

    return (distance < mile_in_gps*5) ? true : false 
}


export { Is_Chip_At_Store }




