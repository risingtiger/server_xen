

type bool  = boolean; type str  = string; type int  = number;

declare var app:any;
declare var APPVERSION: str;


//{--app_imports--}
import Particle from "./particle.js";
import Stats from "./admin/stats.js";
import Admin_Particle from "./admin/admin_particle.js";

//import { Particle_Data_Usage_All_Product_Chips }  from "./particle_data_usage.js";
//import { General_Funcs_Get_Particle_Device_Info }  from "./generalfuncs.js";
//import { Admin_Particle_Rename_Devices_To_Match_Machine_Chip } from "./admin_particle.js";
//import { Get_Machines_To_Sync_With_PWTData, Sync_PWT_Machines } from "./pwtdatasync.js";
//import { Location_Match } from "./location_match.js"
//import { Reconcile }  from "./reconcile.js";
//import { Misc_Quicky_Show_Prop_Of_All_Machines }  from "./misc_quickies.js";
//import { GetMachinesForSync as AdminPWTDataGetMachinesForSync, Sync as AdminPWTDataSync } from "./admin/pwtdatasync.js";
//{--end_app_imports--}




//{--app_declarations--}
const APPINSTANCE_PROJECTID   = "purewatertech"
const APPINSTANCE_KEYJSONFILE = "/Users/dave/.ssh/purewatertech-ad1adb2947b8.json"
const APPINSTANCE_IDENTITY_PLATFORM_API = "AIzaSyCdBd4FDBCZbL03_M4k2mLPaIdkUo32giI"
//{--end_app_declarations--}




//{--app_routes--}


app.get( '/api/pwt/particle/locatechip_by_celltower', particle_locatechip_by_celltower)       

app.get( '/api/pwt/particle/getchipdetails',          particle_get_device_info)

app.get( '/api/pwt/admin/stats/particle',             admin_stats_particle)

/*
app.get("/api/sse_listen_test_trigger", (_req, res) => {
    SSEvents.TriggerUpdate(SSEvents.SSE_Triggers.PWTSync, ["TEST PWTSYNC UPDATE"])

    res.setHeader('Appversion', APPVERSION)
    res.status(200).send(JSON.stringify({message:"triggered"}))
})
*/



async function particle_locatechip_by_celltower(req:any, res:any) {

    const account = req.query.particleaccount as str
    const id      = req.query.particleid as str

    const gps = await Particle.Locate_By_Cell_Tower(account, id).catch(er=> res.status(400).send(er))

    res.setHeader('Appversion', APPVERSION);
    res.status(200).send(JSON.stringify(gps))
}




async function particle_get_device_info(req:any, res:any) {

    const account = req.query.particleaccount as str
    const id      = req.query.particleid as str

    const info = await Particle.Get_Device_Info(account, id)

    res.setHeader('Appversion', APPVERSION);
    res.status(200).send(JSON.stringify(info))
}




async function admin_stats_particle(req:any, res:any) {

    const stats = await Stats.Get_All(db, secrets_client)

    res.setHeader('Appversion', APPVERSION);
    res.status(200).send(JSON.stringify(stats))

    /*
    function Stats_Get_MachineStatusStats(db:any, machine_id:str) {   return new Promise(async (res, _rej)=> {

        const machine_statuses = db.collection(`machines/${machine_id}/statuses`)

        const count_snapshot = await machine_statuses.count().get()

        return res({count: count_snapshot.data().count})
    })}
    */
}


    

/*
    app.get('/api/getstatusstats', (_req:any, res:any) => {
    
        Stats_Get_All_MachineStatusStats(db)
            .then((statusstats:any)=> {
                res.setHeader('Appversion', APPVERSION);
                res.status(200).send(JSON.stringify(statusstats))
            })
            .catch((er:any)=> {
                res.status(400).send(er)
            })
    })
*/




/*
  app.get('/api/reconcile', (_req:any, res:any) => {

    Reconcile(db, secrets_client)
      .then(results=> {
        res.setHeader('Appversion', APPVERSION);
        res.status(200).send(JSON.stringify(results))
      })
      .catch(er=> {
        res.status(400).send(er)
      })

  })
*/



/*
    app.get('/api/data_usage/:particle_account', (req:any, res:any) => {

        Particle_Data_Usage_All_Product_Chips(db, req.params.particle_account, secrets_client)

            .then(results=> {
                res.setHeader('Appversion', APPVERSION);
                res.status(200).send(JSON.stringify(results))
            })

            .catch(er=> {
                res.status(400).send(er)
            })

    })
*/



/*
    app.get('/api/location_match', (req:any, res:any) => {

        Location_Match(db)

            .then(results=> {
                res.setHeader('Appversion', APPVERSION);
                res.status(200).send(JSON.stringify(results))
            })

            .catch(er=> {
                res.status(400).send(er)
            })

    })
*/



/*
  app.get('/api/admin_particle_rename', (_req:any, res:any) => {

    Admin_Particle_Rename_Devices_To_Match_Machine_Chip(db, "accounts_risingtiger_com", secrets_client)
      .then(results=> {
        res.setHeader('Appversion', APPVERSION);
        res.status(200).send(JSON.stringify(results))
      })
      .catch(er=> {
        res.status(400).send(er)
      })

  })
*/



/*
  app.get('/api/misc_quicky', (_req:any, res:any) => {

    Misc_Quicky_Show_Prop_Of_All_Machines(db, secrets_client)
      .then(results=> {
        res.setHeader('Appversion', APPVERSION);
        res.status(200).send(JSON.stringify(results))
      })
      .catch(er=> {
        res.status(400).send(er)
      })

  })
*/

    // Admin APIs

/*
    app.get('/api/admin/pwtdata/getmachines_for_sync', (_req:any, res:any) => {
        AdminPWTDataGetMachinesForSync(res, db);   
    })
*/

/*
    app.post('/api/admin/pwtdata/sync', (_req:any, res:any) => {   
        AdminPWTDataSync(res, db);  
    })
*/





//{--end_app_routes--}






//export { Init, projectId, keyFilename, identity_platform_api }
