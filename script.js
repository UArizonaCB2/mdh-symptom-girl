// Symptom map that connects symptoms to regions. Contents of this
// can dynamically change.
// NOTE: This is not the full JSON. Will be updated once symptoms are finalized.
const symptomMap = {
    "region1": [
        { "value": "forgetfulness", "text": "Forgetfulness"},
        { "value": "dizziness_fainting ", "text": "Dizziness/Fainting" },
        { "value": "headache", "text": "Headache", "critical": "yes"},
        { "value": "snoring", "text": "Snoring" },
        { "value": "nausea", "text": "Nausea/Vomiting/Reflux"},
        { "value": "visual_changes", "text": "Visual Changes", "critical": "yes"},
        { "value": "fever", "text": "Fever", "critical": "yes"},
    ],
    "region2": [
        { "value": "heart_palpitations", "text": "Heart Palpitations", "critical": "yes"},
        { "value": "shortness_of_breath", "text": "Shortness Of Breath" },
        { "value": "swollen_hands", "text": "Swollen Hands"},
        { "value": "sore_nipples", "text": "Sore Nipples" },
        { "value": "colostrum", "text": "Colostrum/Milk" },
        { "value": "fatigue", "text": "Fatigue" },
        { "value": "itchy_skin", "text": "Itchy Skin" },
        { "value": "contractions", "text": "Contractions", "critical":"yes"},
    ],
    "region3": [
        { "value": "hip_pelvic_vaginal_pain", "text": "Hip/Pelvic/Vaginal Pain"},
        { "value": "vaginal_discharge", "text": "Vaginal Discharge/Itching"},
        { "value": "constipation", "text": "Constipation"},
        { "value": "urinary_frequency", "text": "Unirary Frequency"},
        { "value": "bleeding_spotting", "text": "Bleeding/Spotting", "critical": "yes"},
        { "value": "leaking_fluid", "text": "Leaking Fluid", "critical": "yes"},
        { "value": "change_in_sex_drive", "text": "Change in Sex Drive"},
    ],
    "region4": [
        { "value": "new_stretch_marks", "text": "New Stretch Marks"},
        { "value": "swollen_feet", "text": "Swollen Feet"},
        { "value": "varicose_veins", "text": "Varicose Veins"},
        { "value": "restless_legs", "text": "Restless Legs"},
        { "value": "back_pain", "text": "Back Pain"},
        { "value": "leg_cramps", "text": "Leg Cramps"},
        { "value": "sciatica", "text": "Sciatica"},
    ]
};



// This array holds the values of the active symptoms recorded.
let activeSymptoms = [];
let currentRegion = "none";
let scontainerVisible = false;
let openedFromRecord = false;
let anythingClicked = false;
let criticalSwitch = false;

let symptomsReported = {"timestamp": null, "symptoms": []}

function showSymptoms(id) {
    if (currentRegion != "none") {
        // Don't open a new region if one is already visible
        return;
    }    
        anythingClicked = true;
        scontainerVisible = true;
        currentRegion = id;
        console.log(currentRegion);


        const temp = document.getElementById('disclaimer');
        if (!(id in symptomMap)) {
            // Simulate closing by clicking on something random
            close(temp);
            openedFromRecord = false;
            return;
        }
        const region = symptomMap[id];
        const holder = document.getElementById('scontainer');
        scontainer.style = "display:inline";
        let innerHTML = "";
        for (const spair of region) {
            const val = spair['value'];
            const text = spair['text'];
            const crit = spair['critical'];
           
            //innerHTML += "<div class='symptomrow' onClick=\"symptomclicked('" + val + "');\"><div id='" + val + "' class='checkbox'></div><div class='label'>" + text + "</div></div>"
            if (symptomsReported["symptoms"].includes(val)) {
                innerHTML += "<div class='symptomrow' onClick=\"symptomclicked('" + val + "');\"><div id='" + val + "' class='checkbox-active'></div><div class='label'>" + text + "</div></div>"
            } else {
                innerHTML += "<div class='symptomrow' onClick=\"symptomclicked('" + val + "');\"><div id='" + val + "' class='checkbox'></div><div class='label'>" + text + "</div></div>"
            }
        }
        // Add in appropriate buttons
        if (openedFromRecord) {
            innerHTML += "<div id=\"next\"><input type=\"button\" value=\"Next\" class=\"recordButton\" onclick=\"closeAndOpenNext('" + id + "')\"></input></div>"
        } else {
            innerHTML += "<div id=\"save\"><input type=\"button\" value=\"Save\" class=\"recordButton\" onclick=\"closeId('disclaimer')\"></input></div>"
        }
        scontainer.innerHTML = innerHTML;

}

function closeAndOpenNext(id) {
    save();
    close(document.getElementById('record'));
    showSymptoms('region' + (parseInt(id.charAt(id.length - 1))+1));
}

function submitForm(id) {
    const formDiv = document.getElementById("symptoms" + id);
    formDiv.style = "display:none";
}

function record() {
    openedFromRecord = true;
    showSymptoms("region1");
}

function save() {
    // TODO: Implement API calls
    symptomsReported["timestamp"] = Date.now();
    if (symptomsReported.symptoms.length != 0) {
        console.log(JSON.stringify(symptomsReported)); // Replace this line with API call
    }
    symptomsReported['symptoms'] = [];
    showDisclaimer();
}

function showDisclaimer() {
    if (criticalSwitch) {
        let disclaimer = document.getElementById("disclaimer");
        disclaimer.style = "display:flex";
        criticalSwitch = false;
        return;
    }        
}

function hideDisclaimer() {
    let disclaimer = document.getElementById("disclaimer");
    disclaimer.style = "display:none";
}

function symptomclicked(symptomid) {
    const ele = document.getElementById(symptomid);
    // Toggle the checked state of the fake checkbox.
    if (ele.className == 'checkbox') {
        ele.className = 'checkbox-active';

        for (const spair of symptomMap[currentRegion]) {
            if (spair['value'] == symptomid && spair['critical'] == 'yes') {
                criticalSwitch = true;
                console.log("crit switch  = true");
            }
        }
        
    }
    else {
        ele.className = 'checkbox';
    }

    if (symptomsReported["symptoms"].includes(symptomid)) {
        symptomsReported["symptoms"].splice(symptomsReported["symptoms"].indexOf(symptomid), 1);
        
    } else {
        symptomsReported["symptoms"].push(symptomid);
        console.log("Added " + symptomid + " to data");
    }

    // TODO: Add logic to add the symptomid to the `activeSymptoms` array if it does not exist. If it does then remove it. 
}


function close(target) {
    const area = document.getElementById('scontainer');
/*
    if (scontainerVisible) {
        // Reset for next click
        scontainerVisible = false;
        return; 
    }*/

    if (!area.contains(target) && currentRegion != "none") {
        currentRegion = "none";
        scontainer.style = "display:none";
        save()
    }
}

function closeId(id) {
    const target = document.getElementById(id);
    const area = document.getElementById('scontainer');
/*
    if (scontainerVisible) {
        // Reset for next click
        scontainerVisible = false;
        return; 
    }*/

    if (!area.contains(target) && currentRegion != "none") {
        currentRegion = "none";
        scontainer.style = "display:none";
        save()
    }
}

// Event listener for closing the symptom selector
// document.addEventListener('click', (event) => {close(event.target)});

//TODO: 
/*
Figure out CSS variables
*/