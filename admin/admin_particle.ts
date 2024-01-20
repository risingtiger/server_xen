

type str  = string; type int  = number; //type bool  = boolean; 

//declare var Gen_Utility_Get_Secret: (secret_name:str) => Promise<void>;

import {appendFileSync, existsSync, writeFileSync} from "fs";
import { General_Funcs_Get_Secrets_Key, General_Funcs_Get_All_Machines } from "./generalfuncs.js";
import fetch from "node-fetch";




const Admin_Particle_Rename_Devices_To_Match_Machine_Chip = (db:any, particle_account:str, secretsClient:any) => {

    return new Promise(async (res, _rej)=> {
        let machines = await General_Funcs_Get_All_Machines(db)

        for(const machine of machines) {

            let token = ""
            switch (machine.particle.account) {
                case "accounts_risingtiger_com":
                    token = ""
                    break;
                case "rfs_risingtiger_com":
                    token = ""
                    break;
                case "west_pwt_risingtiger_com":
                    token = ""
                    break;
                default:
                    break;
            }

            let rs = await fetch("https://api.particle.io/v1/devices/"+machine.particle.id, {
                method: "PUT",
                body: `name=pwt_${machine.chip}&access_token=`+token,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })

            await new Promise((res, _rej)=> setTimeout(res, 1200))

            console.log(rs.status, " ", machine.chip)
        }

        res("done renaming particle device names")
    })
} 




const Admin_Particle = { }
export default Admin_Particle




