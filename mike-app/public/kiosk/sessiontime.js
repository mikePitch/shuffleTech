// Get the current time
// var currentTime = new Date();
var currentTime = roundToNearest15 (new Date());

// Create an array to hold the options for the dropdown menu
var options = [];

// Loop through the next 24 hours, adding a new option for each 15-minute increment
for (var i = 0; i < 4 * 4; i++) {
  // Create a new Date object for the current time plus the 15-minute increment
  var time = new Date(currentTime.getTime() + (i * 15 * 60 * 1000));

  // Format the time as a string in the format "HH:MM"
  var timeString = time.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});

  // Add the time string to the array of options
  options.push(timeString);
}

function roundToNearest15(date = new Date()) {
  const minutes = 15;
  const ms = 1000 * 60 * minutes;

  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

// Create the dropdown menu using the options array
var select = document.getElementById("timeList");
for (var i = 0; i < options.length; i++) {
  var option = document.createElement("option");
  option.value = options[i];
  option.text = options[i];
  option.className = "timeTile"
  select.appendChild(option);
}