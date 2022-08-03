/**
 * HTML functions
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function parseBooleanFormValue(str) {
  if (!str) {
    return false;
  }
  if (typeof str == 'string') {
    str = str.trim().toLowerCase();
  }
  if (str == 'false' || str == '0') {
      return false;
  }
  return !!str;
}      
      
