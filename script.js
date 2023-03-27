const API_KEY = 'AIzaSyAe8eP7ELj_j_lEx5NR3Sg2tUSANPrFk5k';
const SHEET_ID = '1TIGTxzLnmkzUwCiPE5tDnaisLqefHILqkb30qJ62934';

nameSelect = document.querySelector("#nameSelect")
daySelect = document.querySelector("#daySelect")
nameSchedule = document.querySelector("#nameSchedule")
horaireComplet = document.querySelector("#horaireComplet")
breakSchedule = document.querySelector("#breakSchedule")
classEndTable = document.querySelector("#classEndTable")
classEnd = document.querySelector("#classEnd")
matchingBreaksTable = document.querySelector("#matchingBreaksTable")
matchingBreaks = document.querySelector("#matchingBreaks")
studentCount = 0
scheduleData = []
date = new Date()
const daysOfTheWeek = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi"]

function updateMatchingBreaks()
{
    dayIndex = daySelect.selectedIndex
    matchingBreaks.querySelector("h2").innerHTML = `En pause avec ${nameSelect.value} ${daySelect.value.toLowerCase()}`
    matchingBreaksTable.innerHTML = ""

    for (let i = 0; i < 10; i++) {
        timeFrame = getStartAndEnd(nameSelect.selectedIndex+1,(i+2)+(11*dayIndex))
        if (scheduleData[nameSelect.selectedIndex+1][(i+2)+(11*dayIndex)] == "Pause")
        {
            for (let personIndex = 1; personIndex <= studentCount; personIndex++) 
            {
                if (scheduleData[personIndex][(i+2)+(11*dayIndex)] == "Pause")
                {
                    timeFrame2 = getStartAndEnd(personIndex,(i+2)+(11*dayIndex))
                    if (!document.getElementById(`nameMatchingBreak-${personIndex}-${timeFrame2}`) && personIndex != nameSelect.selectedIndex+1)
                    {
                        if (!document.getElementById("matchingBreak-"+timeFrame))
                            matchingBreaksTable.innerHTML+= `<th id="matchingBreak-${timeFrame}">${timeFrame}</th>`  
                        matchingBreaksTable.innerHTML+= `<td id="nameMatchingBreak-${personIndex}-${timeFrame2}">${scheduleData[personIndex][0]} (${timeFrame2})</td>`  
                    }
                }
            }
        }
    }
}

function updateClassEnd()
{
    dayIndex = daySelect.selectedIndex
    classEndTable.innerHTML = ""
    classEnd.querySelector("h2").innerHTML = `Heures de fin (${daySelect.value})`
    for (let i = 0; i < 10; i++) {
        
        for (let personIndex = 1; personIndex <= studentCount; personIndex++) {
            currentDaySchedule = scheduleData[personIndex].slice(2+(11*dayIndex),12+(11*dayIndex))
            
            if (getClassEnd(personIndex, dayIndex) == (i+9)+"h00")
            {
                if (!document.getElementById(`endHour-${i+9}`))
                    classEndTable.innerHTML += `<th id="endHour-${i+9}">${i+9}h00</th>`
                classEndTable.innerHTML += `<td>${scheduleData[personIndex][0]}</td>`
            }  
        }  
    }
}

function getClassEnd(personIndex, dayIndex)
{
    currentDaySchedule = scheduleData[personIndex].slice(2+(11*dayIndex),12+(11*dayIndex))
    for (let i = currentDaySchedule.length-1; i >= 0; i--) {
        if (currentDaySchedule[i] != "")
        {
            return (i+9)+"h00"
        }
    }
    return "Pas de cours"
}

function updateHoraireComplet()
{
    dayIndex = daySelect.selectedIndex
    horaireComplet.querySelector("h2").innerHTML = `Horaire (${nameSelect.value}-${daySelect.value})`

    currentDaySchedule = scheduleData[nameSelect.selectedIndex+1].slice(2+(11*dayIndex),12+(11*dayIndex))

    loopIndex = 0
    nameSchedule.innerHTML = "<tr><th>Heure</th><th>Cours</th></tr>"
    currentDaySchedule.forEach(cours => 
        {
            nameSchedule.innerHTML += `<tr><td>${scheduleData[0][loopIndex+2]}</td><td>${cours}</td></tr>`
            loopIndex++
        })
}

function getStartClassIndex(personIndex, classIndex)
{
    classType = scheduleData[personIndex][classIndex]
    firstClass = classIndex
    while (scheduleData[personIndex][firstClass-1] == classType){
        firstClass--
    }
    return firstClass
}


function getEndClassIndex(personIndex, classIndex)
{
    classType = scheduleData[personIndex][classIndex]
    lastClass = classIndex
    while (scheduleData[personIndex][lastClass+1] == classType){
        lastClass++
    }
    return lastClass
}

function getStartAndEnd(personIndex, classIndex)
{
    classType = scheduleData[personIndex][classIndex]
    firstClass = getStartClassIndex(personIndex,classIndex)
    lastClass = getEndClassIndex(personIndex, classIndex)

    if (daysOfTheWeek.includes(scheduleData[personIndex][lastClass+1]))
        return scheduleData[0][firstClass]+"-18h00"
    return scheduleData[0][firstClass]+"-"+scheduleData[0][lastClass+1]

}

function updatePersonnesEnPause()
{
    

    day = date.getDay()
    hour = date.getHours()

    breakSchedule.innerHTML = "<tr><th>Nom</th><th>Plage</th></tr>"

    if (day != 0 && day != 6)
    {
        for (let i = 1; i <= studentCount; i++) {
            activity = scheduleData[i][(hour-8)+11*(day-1)+2];
            if (activity == "Pause")
                breakSchedule.innerHTML += `<tr><td>${scheduleData[i][0]}</td><td>${getStartAndEnd(i,(hour-8)+11*(day-1)+2)}</td></tr>`
        }
    }
    else
    {
        breakSchedule.innerHTML = `<h3>Tout le monde est en pause on est la fin de semaine</h3>`
    }
}

function updateInfo()
{
    updatePersonnesEnPause()
    updateHoraireComplet()
    updateClassEnd()
    updateMatchingBreaks()
}

fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:A?valueRenderOption=UNFORMATTED_VALUE&key=${API_KEY}`)
.then(response => response.json())
.then(data => {
    data.values.shift()
    values = data.values
    document.querySelector("#nameSelect").innerHTML = ""
    values.forEach(value => {
        document.querySelector("#nameSelect").innerHTML += `<option value="${value}">${value}</option>`
    });

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A1:CG${values.length+1}?valueRenderOption=UNFORMATTED_VALUE&key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
        studentCount = values.length
        scheduleData = data.values
        day = date.getDay()
        if (day != 0 && day != 6)
            daySelect.selectedIndex = day-1
        updateInfo()

    })
.catch(error => {
    console.error('Error reading cell value:', error);
});
})
.catch(error => {
    console.error('Error reading cell value:', error);
});





