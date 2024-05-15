document.addEventListener("DOMContentLoaded", async () => {
  await displayStoredGroups()

  document.addEventListener("click", async (event) => {
    const target = event.target
    if (target.classList.contains("group-item") || target.classList.contains("group-name")) {
      const groupId = target.dataset.groupId
      const { groups } = await chrome.storage.sync.get(["groups"])
      const oldPinnedTabs = await chrome.tabs.query({ pinned: true })
      const oldPinnedTabsIds = oldPinnedTabs.map((tab) => tab.id)

      const newPinnedTabsUrls = groups.find((group) => group.id === groupId).pinnedTabsUrls
      newPinnedTabsUrls.forEach(async (url) => {
        await chrome.tabs.create({
          url: url,
          pinned: true,
        })
      })

      await chrome.tabs.remove(oldPinnedTabsIds)
    }

    if (target.classList.contains("remove-button")) {
      const groupIdToRemove = target.dataset.groupId
      const { groups } = await chrome.storage.sync.get(["groups"])
      const newGroups = groups.filter((group) => group.id !== groupIdToRemove)
      await chrome.storage.sync.set({ groups: newGroups })
      displayStoredGroups()
    }
  })

  document.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && (event.target.classList.contains("group-item") || event.target.classList.contains("remove-button"))) {
      event.target.click()
    }

    const searchBoxElement = document.getElementById("searchBox")
    if (searchBoxElement !== document.activeElement) {
      searchBoxElement.focus()
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

  document.getElementById("searchBox").addEventListener("input", async () => {
    const searchTerm = document.getElementById("searchBox").value

    const groupsDisplay = document.getElementById("groupsDisplay")
    while (groupsDisplay.firstChild) {
      groupsDisplay.removeChild(groupsDisplay.lastChild)
    }

    if (!searchTerm) {
      displayStoredGroups()
      return
    }

    var { groups } = await chrome.storage.sync.get(["groups"])
    if (!groups) groups = []

    const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchTerm.toLowerCase()))

    filteredGroups.forEach((group, index) => {
      const groupElement = createGroupItemElement(group.name, group.id)
      groupsDisplay.appendChild(groupElement)
    })
  })
})

const displayStoredGroups = async () => {
  var { groups } = await chrome.storage.sync.get(["groups"])
  if (!groups) groups = []

  const groupsDisplay = document.getElementById("groupsDisplay")
  while (groupsDisplay.firstChild) {
    groupsDisplay.removeChild(groupsDisplay.lastChild)
  }

  groups.forEach((group, index) => {
    const groupElement = createGroupItemElement(group.name, group.id)
    groupsDisplay.appendChild(groupElement)
    if (index === 0) groupElement.focus()
  })
}

const dragStartHandler = (event) => {
  event.dataTransfer.setData("text/plain", event.target.dataset.groupId)
  event.dataTransfer.dropEffect = "move"
}
const dragoverHandler = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = "move"
}
const dropHandler = async (event) => {
  event.preventDefault()
  const movingItemGroupId = event.dataTransfer.getData("text/plain")
  const targetItemGroupId = event.target.dataset.groupId

  const { groups } = await chrome.storage.sync.get(["groups"])

  const indexOfMovingGroup = groups.forEach((group, index) => {
    if (group.id === movingItemGroupId) return index
  })
  const indexOfTargetGroup = groups
    .map((group, index) => {
      if (group.id === targetItemGroupId) return index
    })
    .filter((group) => group)
  const movingGroup = groups.filter((group) => group.id === movingItemGroupId)[0]
  const filteredGroups = groups.filter((group) => group.id !== movingItemGroupId)
  const newGroups = filteredGroups.toSpliced(indexOfTargetGroup, 0, movingGroup)

  await chrome.storage.sync.set({ groups: newGroups })
  displayStoredGroups()
}

const createGroupItemElement = (groupName, groupId) => {
  const nameElement = document.createElement("span")
  nameElement.dataset.groupId = groupId
  nameElement.classList.add("group-name")
  nameElement.appendChild(document.createTextNode(groupName))

  const deleteElement = document.createElement("span")
  deleteElement.dataset.groupId = groupId
  deleteElement.classList.add("remove-button")
  deleteElement.role = "button"
  deleteElement.tabIndex = 3
  deleteElement.appendChild(document.createTextNode("Remove"))

  const groupElement = document.createElement("div")
  groupElement.dataset.groupId = groupId
  groupElement.classList.add("group-item")
  groupElement.role = "button"
  groupElement.tabIndex = 0
  groupElement.draggable = true
  groupElement.addEventListener("dragstart", dragStartHandler)
  groupElement.ondrop = dropHandler
  groupElement.ondragover = dragoverHandler
  groupElement.appendChild(nameElement)
  groupElement.appendChild(deleteElement)

  return groupElement
}
