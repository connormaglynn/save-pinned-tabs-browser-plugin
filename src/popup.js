document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("saveButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "savePinnedTabs" })
  })

  document.getElementById("displayPinnedTabsUrls").addEventListener("click", async () => {
    const result = await chrome.storage.sync.get(["pinnedTabs"])
    document.getElementById("pinnedTabsDisplay").textContent = JSON.stringify(result.pinnedTabs)
  })

  document.getElementById("removePinnedTabsUrls").addEventListener("click", () => {
    chrome.storage.sync.clear()
  })
})
