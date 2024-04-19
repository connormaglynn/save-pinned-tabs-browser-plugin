document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("saveButton").addEventListener("click", async () => {
    const groupName = document.getElementById("groupName").value

    const pinnedTabs = await chrome.tabs.query({ pinned: true })
    const pinnedTabsUrls = pinnedTabs.map((tab) => tab.url)

    var { groups } = await chrome.storage.sync.get(["groups"])
    if (!groups) groups = []
    groups.push({ name: groupName, pinnedTabsUrls: pinnedTabsUrls })

    await chrome.storage.sync.set({ groups: groups })
    console.log(`Pinned tabs saved successfully: [ ${Array.toString(groups)} ]`)
  })

  document.getElementById("displayPinnedTabsUrls").addEventListener("click", async () => {
    const result = await chrome.storage.sync.get(["groups"])
    document.getElementById("pinnedTabsDisplay").textContent = JSON.stringify(result.groups)
  })

  document.getElementById("removePinnedTabsUrls").addEventListener("click", () => {
    chrome.storage.sync.clear()
  })
})
