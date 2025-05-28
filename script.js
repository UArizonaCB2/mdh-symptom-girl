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
let currentRegion = "none";
let openedFromRecord = false;
let criticalSwitch = false;
let disclaimerShown = false;

// Stores the final symptom region argument (eg: region4).
// This is used to change the text in the next/save button when cycling through all the symptoms.
const finalRegion = "region4";

let symptomsReported = {"timestamp": null, "symptoms": []}

function resetStates() {
    currentRegion = "none";
    openedFromRecord = false;
    criticalSwitch = false;
    symptomsReported = {"timestamp": null, "symptoms": []};
}

function showSymptoms(id) {
    // Check and see if the symptom container is already open. If it is then don't do anything.
    if (document.getElementById("scontainer").style.display != "none") {
        return
    }

    // Go ahead and hide all the visual overlays so the user knows she cannot click outside.
    hideSeletors();

    currentRegion = id;

    const region = symptomMap[id];
    scontainer.style = "display:inline";
    let innerHTML = "";
    for (const spair of region) {
        const val = spair['value'];
        const text = spair['text'];

        if (symptomsReported["symptoms"].includes(val)) {
            innerHTML += "<div class='symptomrow' onClick=\"symptomclicked('" + val + "');\"><div id='" + val + "' class='checkbox-active'></div><div class='label'>" + text + "</div></div>"
        } else {
            innerHTML += "<div class='symptomrow' onClick=\"symptomclicked('" + val + "');\"><div id='" + val + "' class='checkbox'></div><div class='label'>" + text + "</div></div>"
        }
    }
    // Add in appropriate buttons
    if (openedFromRecord && id != finalRegion) {
        innerHTML += "<div id=\"next\"><input type=\"button\" value=\"Next\" class=\"recordButton\" onclick=\"closeAndOpenNext('" + currentRegion + "')\"></input></div>"
    } else {
        innerHTML += "<div id=\"save\"><input type=\"button\" value=\"Save\" class=\"recordButton\" onclick=\"closeAndSave('scontainer');\"></input></div>"
    }
    scontainer.innerHTML = innerHTML;
}

function closeAndOpenNext(id) {
    close('scontainer');
    showSymptoms('region' + (parseInt(id.charAt(id.length - 1))+1));
}

function showAllSymptoms() {
    openedFromRecord = true;
    showSymptoms("region1");
}

function save() {
    // TODO: Implement API calls
    symptomsReported["timestamp"] = Date.now();

    // Don't show the checkmark from here if we have to show the disclaimer.
    if(!criticalSwitch) {
        showCheckmark();
    }
    // Show the disclaimer if a critical symptom has been recorded.
    showDisclaimer();

    // We will decouple all the symptoms stores in the array, and then call the API one at a time to add them.
    let deviceItems = [];
    for (symptom of symptomsReported["symptoms"]) {
        const item = {
            identifier: "symptom-"+Date.now().toString()+"-"+Math.ceil(Math.random()*10e10).toString(),
            type: "symptom",
            value: symptom,
            observationDate: new Date(symptomsReported["timestamp"]),
        }

        deviceItems.push(item);
    }

    console.log(deviceItems);

    // Call MDH API to ship this data off to them.
    MyDataHelps.persistDeviceData(deviceItems).then(()=>{
        console.log("MDH API returned successfully for storage");
        //TODO: Show the checkmark so the user knows it was recorded.
    }).catch(()=>{
        console.log("Something went wrong with storage through API");
        //TODO: Show an error asking the user to try again.
    })

    // Call MDH API to update the custom fields for symptom counts.
    MyDataHelps.getParticipantInfo().then(
    (result)=>{
        const customFields = result.customFields;
        let daily_symptoms = safeIntConvert(customFields.daily_symptom_count);
        let weekly_symptoms = safeIntConvert(customFields.weekly_symptom_count);
        let total_symptoms = safeIntConvert(customFields.total_symptom_count);

        const symptomCount = symptomsReported["symptoms"].length;
        daily_symptoms += symptomCount;
        weekly_symptoms += symptomCount;
        total_symptoms += symptomCount;

        MyDataHelps.persistParticipantInfo({},
                                           {'daily_symptom_count':daily_symptoms.toString(),
                                            'weekly_symptom_count':weekly_symptoms.toString(),
                                            'total_symptom_count':total_symptoms.toString(),
                                           });
    })

    // Reset all states back to their starting states.
    resetStates();
}

function showCheckmark() {
    // Show the checkmark for the user
    const checkmark = document.getElementById("checkmark");
    checkmark.style.display = "inline";
    checkmark.classList.add("fade-out");
    // Perform haptic vibration to let the user know we are done.
    vibrate(500);
    checkmark.addEventListener("animationend", ()=>{
        checkmark.style.display = "none";
        checkmark.classList.remove("fade-out");
        // Make to show all the selector overlays again.
        showSelectors();
    })
}

// Function which performs vibration for a given amount of duration(ms)
function vibrate(duration) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

// Method which hides all the overlays.
function hideSeletors() {
    const selector_container = document.getElementById("selector-container");
    selector_container.classList.remove("fade-in");
    selector_container.classList.add("fade-out");
}

// Method which makes all the seletor overlays appear again.
function showSelectors() {
    const selector_container = document.getElementById("selector-container");
    selector_container.classList.remove("fade-out");
    selector_container.classList.add("fade-in");
}

function showDisclaimer() {
    if (criticalSwitch) {
        let disclaimer = document.getElementById("disclaimer");
        disclaimer.style = "display:flex";
        criticalSwitch = false;
    }
}

function hideDisclaimer() {
    let disclaimer = document.getElementById("disclaimer");
    disclaimer.style = "display:none";
    disclaimerShown = false;

    showCheckmark();
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
    }
}

function close(id) {
    const target = document.getElementById(id);
    target.style = "display:none";
}

function closeAndSave(id) {
    close(id);
    // Save the symptoms.
    save();
}

window.addEventListener("load", ()=>{
    document.getElementById("main").style.height = window.innerHeight.toString()+"px";
})
