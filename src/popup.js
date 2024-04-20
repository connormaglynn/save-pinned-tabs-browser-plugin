document.addEventListener("DOMContentLoaded", async () => {
  await displayStoredGroups()

  document.addEventListener("click", async (event) => {
    const target = event.target
    if (target.classList.contains("groupItem")) {
      console.log(`hello: ${target.dataset.id}`)
      const groupId = target.dataset.id
      const { groups } = await chrome.storage.sync.get(["groups"])
      const pinnedTabsUrls = groups.find((group) => group.id === groupId).pinnedTabsUrls

      pinnedTabsUrls.forEach(async (url) => {
        await chrome.tabs.create({
          url: url,
          pinned: true,
        })
      })
    }
  })

  document.getElementById("saveButton").addEventListener("click", async () => {
    const groupName = document.getElementById("groupName").value

    const pinnedTabs = await chrome.tabs.query({ pinned: true })
    const pinnedTabsUrls = pinnedTabs.map((tab) => tab.url)

    var { groups } = await chrome.storage.sync.get(["groups"])
    if (!groups) groups = []
    groups.push({ id: Math.random().toString(16).slice(2), name: groupName, pinnedTabsUrls: pinnedTabsUrls })

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
    const groupElement = document.createElement("button")
    groupElement.dataset.id = group.id
    groupElement.classList.add("groupItem")
    groupElement.appendChild(document.createTextNode(group.name))
    groupsDisplay.appendChild(groupElement)
  })
}
