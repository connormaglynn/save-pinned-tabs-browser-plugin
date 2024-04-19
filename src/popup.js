document.addEventListener("DOMContentLoaded", function () {
  // Add your event listener here
  document.getElementById("saveButton").addEventListener("click", function () {
    // Send a message to the background script
    chrome.runtime.sendMessage({ action: "savePinnedTabs" }, function (response) {
      console.log(response.message)
    })
  })

  document.getElementById("displayPinnedTabsUrls").addEventListener("click", function () {
    chrome.storage.sync.get(["pinnedTabs"]).then((result) => {
      console.log(result)
      document.getElementById("pinnedTabsDisplay").textContent = JSON.stringify(result.pinnedTabs)
    })
  })
})
