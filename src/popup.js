document.addEventListener("DOMContentLoaded", async () => {
  await displayStoredGroups()

  document.addEventListener("click", async (event) => {
    const target = event.target
    if (target.classList.contains("group-item") || target.dataset.clickEvent === "OPEN_GROUP_TABS_BY_ID") {
      const groupId = target.dataset.groupId
      const { groups } = await chrome.storage.sync.get(["groups"])
      const oldPinnedTabs = await chrome.tabs.query({ pinned: true })
      const oldPinnedTabsIds = oldPinnedTabs.map((tab) => tab.id)

      const newGroups = groups && groups.find((group) => group && group.id === groupId)
      const newPinnedTabsUrls = newGroups && newGroups.pinnedTabsUrls
      newPinnedTabsUrls &&
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
      const newGroups = groups.filter((group) => group && group.id !== groupIdToRemove)
      await chrome.storage.sync.set({ groups: newGroups })
      displayStoredGroups()
      const editOverlayElement = document.getElementById("edit-overlay")
      editOverlayElement.classList.remove("show")

      const mainContent = document.getElementsByClassName("main-wrapper")[0]
      mainContent.inert = false
    }

    if (target.classList.contains("save-button")) {
      const groupIdToEdit = target.dataset.groupId
      const { groups } = await chrome.storage.sync.get(["groups"])
      const newPinnedTabsUrls = []
      document.getElementById("editGroupsUrlsList").childNodes.forEach((child) => newPinnedTabsUrls.push(child.value))
      const newGroup = {
        id: groupIdToEdit,
        name: document.getElementById("edit-group-name").value,
        pinnedTabsUrls: newPinnedTabsUrls,
      }
      const newGroups = groups.map((group) => {
        if (group && group.id == groupIdToEdit) {
          console.log(group)
          return newGroup
        }
        return group
      })
      console.log(newGroups)
      await chrome.storage.sync.set({ groups: newGroups })
      displayStoredGroups()
      const editOverlayElement = document.getElementById("edit-overlay")
      editOverlayElement.classList.remove("show")

      const mainContent = document.getElementsByClassName("main-wrapper")[0]
      mainContent.inert = false
    }

    if (target.classList.contains("edit-button")) {
      const mainContent = document.getElementsByClassName("main-wrapper")[0]
      mainContent.inert = true

      const { groups } = await chrome.storage.sync.get(["groups"])
      const groupToEdit = groups.filter((group) => group && group.id === target.dataset.groupId)[0]

      document.getElementById("removeEditWrapperButton").dataset.groupId = groupToEdit && groupToEdit.id
      document.getElementById("saveEditWrapperButton").dataset.groupId = groupToEdit && groupToEdit.id

      const editOverlayElement = document.getElementById("edit-overlay")
      editOverlayElement.classList.add("show")

      const editGroupNameElement = document.getElementById("edit-group-name")
      editGroupNameElement.value = groupToEdit && groupToEdit.name

      const editGroupsUrlsList = document.getElementById("editGroupsUrlsList")
      while (editGroupsUrlsList.firstChild) {
        editGroupsUrlsList.removeChild(editGroupsUrlsList.lastChild)
      }
      groupToEdit &&
        groupToEdit.pinnedTabsUrls &&
        groupToEdit.pinnedTabsUrls.forEach((url) => {
          const urlElement = document.createElement("input")
          urlElement.classList.add("edit-url")
          urlElement.value = url

          editGroupsUrlsList.appendChild(urlElement)
        })
    }

    if (target.id === "closeEditWrapperButton") {
      const editOverlayElement = document.getElementById("edit-overlay")
      editOverlayElement.classList.remove("show")

      const mainContent = document.getElementsByClassName("main-wrapper")[0]
      mainContent.inert = false
    }
  })

  document.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && event.target.dataset.clickOnEnterPress === "true") {
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
    const groupElement = createGroupItemElement(group && group.name, group && group.id)
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
  nameElement.dataset.clickEvent = "OPEN_GROUP_TABS_BY_ID"
  nameElement.clickOnEnterPress = "true"
  nameElement.classList.add("group-name")
  nameElement.appendChild(document.createTextNode(groupName))

  const editElement = document.createElement("span")
  editElement.dataset.groupId = groupId
  editElement.dataset.clickOnEnterPress = "true"
  editElement.classList.add("edit-button")
  editElement.role = "button"
  editElement.tabIndex = 3
  editElement.appendChild(document.createTextNode("Edit"))

  const groupElement = document.createElement("div")
  groupElement.dataset.groupId = groupId
  groupElement.dataset.clickOnEnterPress = "true"
  groupElement.classList.add("group-item")
  groupElement.role = "button"
  groupElement.tabIndex = 0
  groupElement.draggable = true
  groupElement.addEventListener("dragstart", dragStartHandler)
  groupElement.ondrop = dropHandler
  groupElement.ondragover = dragoverHandler
  groupElement.appendChild(nameElement)
  groupElement.appendChild(editElement)

  return groupElement
}
