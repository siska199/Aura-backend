
const blocks = [{ "gym":false, "school":true, "store":false},{ "gym":true, "school":false, "Store":false},{ "gym":true, "school":true, "Store":false,},{ "gym":false, "school":true, "Store":false,},{ "gym":false, "school":false, "Store":true,},]

function findApartemen(data){
    const dataAccess = []
    for(data of blocks){
        total = 0
        if(data.gym){
            total +=1
        }
        if(data.school){
            total +=1
        } 
        if(data.store){
            total+=1
        }
        dataAccess.push(total)
    }
    console.log(dataAccess)
    const maxData = Math.max(...dataAccess)
    const findIndexdata = dataAccess.findIndex(d=>d==maxData)
    
    return(`Block hunian apartemen yang memiliki fasilitas dengan minimum jarak akses adalah block urutan ke ${findIndexdata+1} dengan index ${findIndexdata} `)
}
console.log(findApartemen(blocks))
