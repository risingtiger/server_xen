

import fetch from "node-fetch";

type str = string; type int = number; type bool = boolean;

type ParticleDeviceDetails = {
    name: str,
    last_heard: str,
    last_handshake_at: str,
    online: bool,
    system_firmware_version: str,
    firmware_version: int,
}




async function General_Funcs_Get_Particle_Chips_Of_All_Accounts(secrets_client:any) {

  return new Promise<{llc:any[], east:any[], west:any[]}>(async (res, _rej)=> {

    const llc = await General_Funcs_Get_Particle_Chips_Of_One_Account(secrets_client, "ACCOUNTS_RISINGTIGER_COM")
    const east = await General_Funcs_Get_Particle_Chips_Of_One_Account(secrets_client, "RFS_RISINGTIGER_COM")
    const west = await General_Funcs_Get_Particle_Chips_Of_One_Account(secrets_client, "WEST_PWT_RISINGTIGER_COM")

    llc.forEach((d:any) => d.account = "llc")
    east.forEach((d:any) => d.account = "east")
    west.forEach((d:any) => d.account = "west")

    return res({llc, east, west})
  
  })

}




async function General_Funcs_Get_Particle_Chips_Of_One_Account(secrets_client:any, particle_account:str) {

  return new Promise<any[]>(async (res, _rej)=> {

    const particleAPIKey  = await General_Funcs_Get_Secrets_Key(secrets_client, "PA_"+particle_account);

    const response  = await fetch('https://api.particle.io/v1/devices?access_token=' + particleAPIKey, { headers: { 'Content-Type': 'application/json' } });
    let   chips:any = await response.json();

    return res(chips)
  
  })


}




const General_Funcs_Get_Particle_Device_Info = (particle_account:str, particle_id:str, secrets_client:any) => {

  return new Promise<ParticleDeviceDetails>(async (res, _rej)=> {

    let token = await General_Funcs_Get_Secrets_Key(secrets_client, "pa_"+particle_account)

    const details_req = await fetch(`https://api.particle.io/v1/devices/${particle_id}?access_token=${token}`, { headers:  { 'Content-Type': 'application/json' } } )
    const details     = await details_req.json() as any

    const return_details:ParticleDeviceDetails = {
      name: details.name,
      last_heard: details.last_heard,
      last_handshake_at: details.last_handshake_at,
      online: details.online,
      system_firmware_version: details.system_firmware_version,
      firmware_version: details.firmware_version,
    }

    res(return_details)

  })

} 




async function General_Funcs_Get_All_Machines(db:any) {

  return new Promise<any[]>(async (res, _rej)=> {

    const machinesCollection = db.collection("machines");

    const allMachineDocs  = await machinesCollection.get();

    const machines = allMachineDocs.docs.map((m: any) => ({ id: m.id, ...m.data() }));

    return res(machines)
  
  })


}




function General_Funcs_Get_Secrets_Key(_secretsClient:any, nameP:string) { 

    return new Promise(async (resp:any) => { 

        const g = process.env[nameP]
        resp(g)

        /*
        let n = `projects/purewatertech/secrets/${nameP}/versions/latest`;
        const [accessResponse] = await secretsClient.accessSecretVersion({ name:n });
        resp(accessResponse.payload.data.toString('utf8'));
        */
    })

}




export { General_Funcs_Get_Particle_Chips_Of_All_Accounts, General_Funcs_Get_Particle_Chips_Of_One_Account, General_Funcs_Get_Particle_Device_Info, General_Funcs_Get_All_Machines, General_Funcs_Get_Secrets_Key };


