document.addEventListener("DOMContentLoaded", async () => {
  await displayStoredGroups()

  document.getElementById("saveButton").addEventListener("click", async () => {
    const groupName = document.getElementById("groupName").value

    const pinnedTabs = await chrome.tabs.query({ pinned: true })
    const pinnedTabsUrls = pinnedTabs.map((tab) => tab.url)

    var { groups } = await chrome.storage.sync.get(["groups"])
    if (!groups) groups = []
    groups.push({ name: groupName, pinnedTabsUrls: pinnedTabsUrls })

    await chrome.storage.sync.set({ groups: groups })
    console.log(`Pinned tabs saved successfully: [ ${Array.toString(groups)} ]`)
    await displayStoredGroups()
  })

  document.getElementById("removePinnedTabsUrls").addEventListener("click", async () => {
    chrome.storage.sync.clear()
    await displayStoredGroups()
  })
})

const displayStoredGroups = async () => {
  const groupsDisplay = document.getElementById("groupsDisplay")
  while (groupsDisplay.firstChild) {
    groupsDisplay.removeChild(groupsDisplay.lastChild)
  }

  var { groups } = await chrome.storage.sync.get(["groups"])
  if (!groups) groups = []

  groups.forEach((group, index) => {
    const groupElement = document.createElement("div")
    if (index === 1) groupElement.focus()
    groupElement.appendChild(document.createTextNode(group.name))
    groupsDisplay.appendChild(groupElement)
  })
}
