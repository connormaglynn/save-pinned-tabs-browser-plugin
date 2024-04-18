console.log("hit 1")
document.addEventListener("DOMContentLoaded", function () {
  // Add your event listener here
  console.log("hit 2")
  document.getElementById("saveButton").addEventListener("click", function () {
    // Send a message to the background script
    console.log("hit 3")
    chrome.runtime.sendMessage({ action: "savePinnedTabs" }, function (response) {
      console.log("hit 4")
      console.log(response.message)
    })
  })
})
