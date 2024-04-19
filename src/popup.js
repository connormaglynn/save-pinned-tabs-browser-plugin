document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("saveButton").addEventListener("click", async () => {
    const pinnedTabs = await chrome.tabs.query({ pinned: true })
    const pinnedTabURLs = pinnedTabs.map((tab) => tab.url)
    await chrome.storage.sync.set({ pinnedTabs: pinnedTabURLs })
    console.log(`Pinned tabs saved successfully: [ ${Array.toString(pinnedTabURLs)} ]`)
  })

  document.getElementById("displayPinnedTabsUrls").addEventListener("click", async () => {
    const result = await chrome.storage.sync.get(["pinnedTabs"])
    document.getElementById("pinnedTabsDisplay").textContent = JSON.stringify(result.pinnedTabs)
  })

  document.getElementById("removePinnedTabsUrls").addEventListener("click", () => {
    chrome.storage.sync.clear()
  })
})
