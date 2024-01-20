

type bool  = boolean; type str  = string; type int  = number;

declare var Gen_Utility_Get_Secret: (secret_name:str) => Promise<void>;

//import fetch from "node-fetch";




async function Locate_By_Cell_Tower(account:str, id:str) {   return new Promise(async (res, rej)=> {

    let token = await Gen_Utility_Get_Secret("pa_" + account)

    const diagnostics_p = await fetch(`https://api.particle.io/v1/diagnostics/${id}/last?access_token=${token}`, { headers:  { 'Content-Type': 'application/json' } } )
    const diagnostics = await diagnostics_p.json() as any

    const cellular = diagnostics?.diagnostics?.payload?.device?.network?.cellular
    const cellGlobalIdentity = diagnostics?.diagnostics?.payload?.device?.network?.cellular?.cell_global_identity

    if (cellular && cellGlobalIdentity) {

        let operator = ""

        if (cellular.operator.includes("AT&T")) 
            operator = "AT&T"
        else if (cellular.operator.includes("Verizon")) 
            operator = "Verizon"
        else if (cellular.operator.includes("T-Mobile"))
            operator = "T-Mobile"
        else 
            operator = "Not handled yet -- probably need to come back for others"

        let googleapiObjToSend = {
            homeMobileCountryCode: Number(cellGlobalIdentity.mobile_country_code),
            homeMobileNetworkCode: Number(cellGlobalIdentity.mobile_network_code),
            radioType: "gsm",
            carrier: operator,
            considerIp: false,
            cellTowers: [{
                "cellId": Number(cellGlobalIdentity.cell_id),
                "locationAreaCode": Number(cellGlobalIdentity.location_area_code),
                "mobileCountryCode": Number(cellGlobalIdentity.mobile_country_code),
                "mobileNetworkCode": Number(cellGlobalIdentity.mobile_network_code)
            }]
        }

        const googlAPIResponse_p = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCdBd4FDBCZbL03_M4k2mLPaIdkUo32giI`, {   method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(googleapiObjToSend)   })

        const googlAPIResponse = await googlAPIResponse_p.json() as any

        if (googlAPIResponse && googlAPIResponse.location) {
            const gps = [ Number(googlAPIResponse.location.lat.toFixed(4)), Number(googlAPIResponse.location.lng.toFixed(4)) ]

            res(JSON.stringify(gps))

        } else {
            rej(JSON.stringify({ error: "No GPS" }))
        }
    }
})} 




async function Get_Device_Info(account:str, id:str) {   return new Promise(async (res, _rej)=> {

    let token = await Gen_Utility_Get_Secret("pa_" + account)

    const details_req = await fetch(`https://api.particle.io/v1/devices/${id}?access_token=${token}`, { headers:  { 'Content-Type': 'application/json' } } )
    const details     = await details_req.json() as any

    const return_details = {
      name: details.name,
      last_heard: details.last_heard,
      last_handshake_at: details.last_handshake_at,
      online: details.online,
      system_firmware_version: details.system_firmware_version,
      firmware_version: details.firmware_version,
    }

    res(JSON.stringify(return_details))
})} 




const Particle = { Locate_By_Cell_Tower, Get_Device_Info }

export default Particle




