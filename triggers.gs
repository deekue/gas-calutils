/**
 * Trigger functions
 * 
 * requires scope:     "https://www.googleapis.com/auth/script.scriptapp"
 */

// day: ScriptApp.WeekDay.FRIDAY
function createWeeklyTrigger(funcName, day, hour) {
  return ScriptApp.newTrigger(funcName)
    .timeBased()
    .atHour(hour)
    .onWeekDay(day)  
    .create()
    .getUniqueId();
}

function removeTriggerByName(funcName) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == funcName) {
      ScriptApp.deleteTrigger(triggers[i]);
      break;
    }
  }
}

function listTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    Logger.log("%s: %s", i, triggers[i].getHandlerFunction());
  }
}

function nackOptionalEventsWeekly() {
  Logger.log(nackEventsByTitle('optional', 1));
}

function installTrigger() {
  Logger.log(createWeeklyTrigger('nackOptionalEventsWeekly', ScriptApp.WeekDay.MONDAY, 5));
}
                      
function uninstallTrigger() {
  Logger.log(removeTriggerByName('nackOptionalEventsWeekly'));
}

function installTriggerForm(formObject) {
  return createWeeklyTrigger('nackEventsByTitle', formObject.day, formObject.hour);
}
