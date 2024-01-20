

import fetch from "node-fetch";




const InfluxDBDeleteData = async () => {

  // let token = "DMXLf9z4x6mPlptmmvt0HM6i9oqPQFTQpSOjeORSa54Dm2O-dyFixw9qm6KCMYbaWB06ityzwy5iul0Oujspzg==";
  let token = "F51kupOL6rHy2LANe7LHx4dL9tRqwoMW_XLkyi6VOy-Iky0wpQN8n67_qRGoGyJVTbHPkzYNcAdQc_479pm_EQ==";

  const obj:any = {
    method: "POST",
    headers: {
      'Authorization': `Token ${token}`,
      'Content-type': 'application/vnd.flux',
      'Accept': 'application/csv'
    },
    body: `{ 
      "start": "2023-01-02T23:00:00Z", 
      "stop": "2023-03-31T14:00:00Z",
      "predicate": "_measurement=MTR AND chip=0001"
    }`
  }
  
  fetch(`https://us-central1-1.gcp.cloud2.influxdata.com/api/v2/delete?org=accounts@risingtiger.com&bucket=PWT`, obj).then(response => response.text()).then(_data=> {
        //
  })
  .catch(er=> {
    console.error(er)
  })

}




export { InfluxDBDeleteData }


