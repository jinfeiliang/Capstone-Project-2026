let Offcanvas_Map_Info_DOM = document.querySelector("#offcanvas_map_info");

let OffCanvas_Main_Info_DOM = document.querySelector("#OffCanvas_Main_Info");
let OffCanvas_Extra_Info_DOM = document.querySelector("#OffCanvas_Extra_Info");

let Main_Info_Categories = ["place_name", "place.address"];

function Close_All_Off_Canvas_Accordion_Extra_Information() {
  const secondAccordion = document.querySelector("#collapseTwo");
  const bsCollapse = new bootstrap.Collapse(secondAccordion, {
    toggle: false,
  });
  bsCollapse.hide();
}
function Is_Only_Extra_Data(object) {
  let result = true;
  for (const [key, value] of Object.entries(object)) {
    if (key != "extra_data") {
      result = false;
    }
  }
  return result;
}

async function Load_Data_Off_Canvas(Data) {
  console.log(Data.extra_data.Processing_Method);
  Close_All_Off_Canvas_Accordion_Extra_Information();
  const API_DATA_MANAGER = new DataProcessor(
    Data,
    Data.extra_data.Processing_Method,
  );
  const Standarized_Data = await API_DATA_MANAGER.process();
  console.log(Standarized_Data);

  OffCanvas_Main_Info_DOM.innerHTML = "";
  OffCanvas_Extra_Info_DOM.innerHTML = "";

  for (const [key, value] of Object.entries(Standarized_Data)) {
    if (value == null) {
      continue;
    }
    if (key == "metadata") {
      continue;
    }
    let Formatted_Key_Name = Properties_Name[key] || key;

    let Formatted_Value = value;
    if (typeof Formatted_Value == "object") {
      Formatted_Value = JSON.stringify(Formatted_Value);
    }

    let HTML = `<div>
      <h2>${Formatted_Key_Name}</h2>
      <p>${Formatted_Value}</p>
    </div>`;
    OffCanvas_Main_Info_DOM.insertAdjacentHTML("beforeend", HTML);
  }
  console.log(Standarized_Data.metadata);
  if (
    Standarized_Data.metadata &&
    !Is_Only_Extra_Data(Standarized_Data.metadata)
  ) {
    document.querySelector("#headingTwo").classList.remove("visually-hidden");
    console.log("WOW");
    for (const [key, value] of Object.entries(Standarized_Data.metadata)) {
      if (value == null) {
        continue;
      }
      if (key == "extra_data") {
        continue;
      }
      let Formatted_Key_Name = Properties_Name[key] || key;
      let Formatted_Value = value;
      if (typeof Formatted_Value == "object") {
        Formatted_Value = JSON.stringify(Formatted_Value);
      }
      let HTML = `<div>
      <h2>${Formatted_Key_Name}</h2>
      <p>${Formatted_Value}</p>
    </div>`;
      OffCanvas_Extra_Info_DOM.insertAdjacentHTML("beforeend", HTML);
    }
  } else {
    document.querySelector("#headingTwo").classList.add("visually-hidden");
    OffCanvas_Extra_Info_DOM.innerHTML =
      "This center does not have extra information";
  }

  const bsOffcanvas = new bootstrap.Offcanvas(Offcanvas_Map_Info_DOM);
  bsOffcanvas.show();
}
