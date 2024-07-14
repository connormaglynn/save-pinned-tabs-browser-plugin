class GroupModel {
  /** @param {string} name @param {Array<string>} urls */
  constructor(name, urls) {
    this.name = name
    this.pinnedTabsUrls = urls
  }
}

class GroupEntity {
  /** @param {string} id @param {string} name @param {Array<string>} urls */
  constructor(id, name, urls) {
    this.id = id
    this.name = name
    this.pinnedTabsUrls = urls
  }
}

class GroupRepository {
  constructor(browser) {
    this.browser = browser
  }

  /** @async @returns {Promise<Array<GroupEntity>>>} */
  async findAll() {
    const { groups } = await this.browser.storage.sync.get(["groups"])
    return groups || []
  }

  /** @async @param {string} id @returns {Primse<GroupEntity | undefined>} */
  async findById(id) {
    const groups = await this.findAll()
    return groups.find((group) => group.id === id)
  }

  /** @async @param {string} id @returns {Promise<undefined>} */
  async removeById(id) {
    const groups = await this.findAll()

    const newGroups = groups.filter((group) => group?.id !== id)
    await this.overwriteAll(newGroups)
  }

  /** @async @param {Array<GroupEntity>} groups @returns {Promise<undefined>} */
  async overwriteAll(groups) {
    await browser.storage.sync.set({ groups: groups })
  }

  /** @async @param {GroupEntity} updatedGroup @returns {Promise<undefined>} */
  async update(updatedGroup) {
    const groups = await this.findAll()
    const newGroups = groups.map((group) => {
      if (group?.id === updatedGroup.id) {
        return updatedGroup
      }
      return group
    })
    await this.overwriteAll(newGroups)
  }

  /** @async @param {GroupModel} group @returns {Promise<undefined>} */
  async add(group) {
    const groups = await this.findAll()
    groups.push({ id: Math.random().toString(16).slice(2), name: group.name, pinnedTabsUrls: group.pinnedTabsUrls })
    await this.overwriteAll(groups)
  }

  /** @async @param {string} partialName @returns {Promise<Array<GroupEntity>>}*/
  async findAllByPartialName(partialName) {
    const groups = await this.findAll()
    return groups.filter((group) => group.name.toLowerCase().includes(partialName.toLowerCase()))
  }
}

const clickEvents = {
  OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT: "OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT",
  REMOVE_GROUP_BY_GROUP_ID_ON_ELEMENT: "REMOVE_GROUP_BY_GROUP_ID_ON_ELEMENT",
  SAVE_GROUP_EDITS_BY_GROUP_ID_ON_ELEMENT: "SAVE_GROUP_EDITS_BY_GROUP_ID_ON_ELEMENT",
  OPEN_EDIT_VIEW_BY_GROUP_ID_ON_ELEMENT: "OPEN_EDIT_VIEW_BY_GROUP_ID_ON_ELEMENT",
  CLOSE_EDIT_VIEW: "CLOSE_EDIT_VIEW",
  CREATE_NEW_GROUP_FROM_CURRENT_PINNED_TABS: "CREATE_NEW_GROUP_FROM_CURRENT_PINNED_TABS",
}

const browser = chrome
const groupRepository = new GroupRepository(browser)

document.addEventListener("DOMContentLoaded", async () => {
  await displayStoredGroups()

  document.addEventListener("click", async (event) => {
    const target = event.target
    const clickEvent = target.dataset.clickEvent

    console.info(`🖱️ ClickEvent Triggered | clickEvent on Target [ ${clickEvent} ]`)

    if (clickEvents.OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const groupId = target.dataset.groupId
      const oldPinnedTabs = await browser.tabs.query({ pinned: true })
      const oldPinnedTabsIds = oldPinnedTabs.map((tab) => tab.id)

      const newGroup = await groupRepository.findById(groupId)
      const newPinnedTabsUrls = newGroup?.pinnedTabsUrls
      newPinnedTabsUrls?.forEach(async (url) => {
        await browser.tabs.create({
          url: url,
          pinned: true,
        })
      })

      await browser.tabs.remove(oldPinnedTabsIds)
    }

    if (clickEvents.REMOVE_GROUP_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const groupIdToRemove = target.dataset.groupId
      groupRepository.removeById(groupIdToRemove).then(() => displayStoredGroups())

      const editOverlayElement = document.getElementById("edit-overlay")
      editOverlayElement.classList.remove("show")
      const mainContent = document.getElementsByClassName("main-wrapper")[0]
      mainContent.inert = false
    }

    if (clickEvents.SAVE_GROUP_EDITS_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const groupIdToEdit = target.dataset.groupId
      const newName = document.getElementById("edit-group-name").value
      const newPinnedTabsUrls = []
      document.getElementById("editGroupsUrlsList").childNodes.forEach((child) => newPinnedTabsUrls.push(child.value))

      const group = await groupRepository.findById(groupIdToEdit)
      group.name = newName
      group.pinnedTabsUrls = newPinnedTabsUrls
      await groupRepository.update(group).then(() => displayStoredGroups())

      const editOverlayElement = document.getElementById("edit-overlay")
      editOverlayElement.classList.remove("show")
      const mainContent = document.getElementsByClassName("main-wrapper")[0]
      mainContent.inert = false
    }

    if (clickEvents.OPEN_EDIT_VIEW_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const mainContent = document.getElementsByClassName("main-wrapper")[0]
      mainContent.inert = true

      const group = await groupRepository.findById(target.dataset.groupId)

      document.getElementById("removeEditWrapperButton").dataset.groupId = group?.id
      document.getElementById("saveEditWrapperButton").dataset.groupId = group?.id

      const editOverlayElement = document.getElementById("edit-overlay")
      editOverlayElement.classList.add("show")

      const editGroupNameElement = document.getElementById("edit-group-name")
      editGroupNameElement.value = group?.name

      const editGroupsUrlsList = document.getElementById("editGroupsUrlsList")
      while (editGroupsUrlsList.firstChild) {
        editGroupsUrlsList.removeChild(editGroupsUrlsList.lastChild)
      }
      group?.pinnedTabsUrls?.forEach((url) => {
        const urlElement = document.createElement("input")
        urlElement.classList.add("edit-url")
        urlElement.value = url

        editGroupsUrlsList.appendChild(urlElement)
      })
    }

    if (clickEvents.CREATE_NEW_GROUP_FROM_CURRENT_PINNED_TABS === clickEvent) {
      const groupName = document.getElementById("groupName").value
      const pinnedTabs = await browser.tabs.query({ pinned: true })
      const pinnedTabsUrls = pinnedTabs.map((tab) => tab.url)

      groupRepository.add(new GroupModel(groupName, pinnedTabsUrls)).then(() => displayStoredGroups())
    }

    if (clickEvents.CLOSE_EDIT_VIEW === clickEvent) {
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

    const groups = await groupRepository.findAllByPartialName(searchTerm)
    groups.forEach((group) => {
      const groupElement = createGroupItemElement(group.name, group.id)
      groupsDisplay.appendChild(groupElement)
    })
  })
})

const displayStoredGroups = async () => {
  const groups = await groupRepository.findAll()

  const groupsDisplay = document.getElementById("groupsDisplay")
  while (groupsDisplay.firstChild) {
    groupsDisplay.removeChild(groupsDisplay.lastChild)
  }

  groups.forEach((group, index) => {
    const groupElement = createGroupItemElement(group?.name, group?.id)
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

  const groups = await groupRepository.findAll()

  const indexOfTargetGroup = groups
    .map((group, index) => {
      if (group.id === targetItemGroupId) return index
    })
    .filter((group) => group)
  const movingGroup = groups.filter((group) => group.id === movingItemGroupId)[0]
  const filteredGroups = groups.filter((group) => group.id !== movingItemGroupId)
  const newGroups = filteredGroups.toSpliced(indexOfTargetGroup, 0, movingGroup)

  groupRepository.overwriteAll(newGroups).then(() => displayStoredGroups())
}

const createGroupItemElement = (groupName, groupId) => {
  const nameElement = document.createElement("span")
  nameElement.dataset.groupId = groupId
  nameElement.dataset.clickEvent = clickEvents.OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT
  nameElement.dataset.clickOnEnterPress = "true"
  nameElement.classList.add("group-name")
  nameElement.appendChild(document.createTextNode(groupName))

  const editElement = document.createElement("span")
  editElement.dataset.groupId = groupId
  editElement.dataset.clickEvent = clickEvents.OPEN_EDIT_VIEW_BY_GROUP_ID_ON_ELEMENT
  editElement.dataset.clickOnEnterPress = "true"
  editElement.classList.add("edit-button")
  editElement.role = "button"
  editElement.tabIndex = 3
  editElement.appendChild(document.createTextNode("Edit"))

  const groupElement = document.createElement("div")
  groupElement.dataset.groupId = groupId
  groupElement.dataset.clickEvent = clickEvents.OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT
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
