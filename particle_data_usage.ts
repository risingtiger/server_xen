

// type bool  = boolean;
type str  = string;
type int  = number;

import {appendFileSync, existsSync, writeFileSync} from "fs";
import { General_Funcs_Get_Secrets_Key, General_Funcs_Get_Particle_Chips_Of_One_Account } from "./generalfuncs.js";
import fetch from "node-fetch";




const FILENAME = "./data_usage.txt"




const Particle_Data_Usage_All_Product_Chips = (_db:any, particle_account:str, secretsClient:any) => {

    return new Promise(async (res, _rej)=> {

        let token = await General_Funcs_Get_Secrets_Key(secretsClient, "pa_"+particle_account) as str

        let chips = await General_Funcs_Get_Particle_Chips_Of_One_Account(secretsClient, particle_account)

        let chip_index = 0

        if (existsSync(FILENAME)) 
        writeFileSync(FILENAME, "")

        next(token, chips, chip_index)

        res("chuggen through now")

    })



} 




function next(token:str, chips:any, chip_index:int) {
    setTimeout(async ()=> {

        let chip = chips[chip_index]
    
        let data_usage_p = await fetch(`https://api.particle.io/v1/sims/${chip.iccid}/data_usage?access_token=${token}`, { headers:  { 'Content-Type': 'application/json' } } )
        let data_usage   = await data_usage_p.json() as any
    
        let chip_data_usage = data_usage.usage_by_day[data_usage.usage_by_day.length-1].mbs_used_cumulative

        if (chip_index === chips.length-1) {
            appendFileSync(FILENAME, `\n\nDONE\n`)
        }

        else {
            appendFileSync(FILENAME, `${chip_index} - ${chip.iccid} --- ${chip_data_usage}\n`)
            chip_index++
            next(token, chips, chip_index)
        }
    
        
        
    }, 1200)
}











export { Particle_Data_Usage_All_Product_Chips }




