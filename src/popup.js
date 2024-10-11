const clickEvents = {
  OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT: "OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT",
  REMOVE_GROUP_BY_GROUP_ID_ON_ELEMENT: "REMOVE_GROUP_BY_GROUP_ID_ON_ELEMENT",
  SAVE_GROUP_EDITS_BY_GROUP_ID_ON_ELEMENT: "SAVE_GROUP_EDITS_BY_GROUP_ID_ON_ELEMENT",
  OPEN_EDIT_VIEW_BY_GROUP_ID_ON_ELEMENT: "OPEN_EDIT_VIEW_BY_GROUP_ID_ON_ELEMENT",
  CLOSE_EDIT_VIEW: "CLOSE_EDIT_VIEW",
  CREATE_NEW_GROUP_FROM_CURRENT_PINNED_TABS: "CREATE_NEW_GROUP_FROM_CURRENT_PINNED_TABS",
}
document.addEventListener("DOMContentLoaded", async () => {
  const browser = chrome
  const groupRepository = new GroupRepository(browser)
  const groupView = new GroupView(groupRepository, clickEvents)

  await groupRepository.removeUnlinkedGroups()
  await groupView.displayStoredGroups()

  document.addEventListener("click", async (event) => {
    const target = event.target
    const clickEvent = target.dataset.clickEvent

    console.info(`🖱️ ClickEvent Triggered | clickEvent on Target[ ${clickEvent} ]`)

    if (clickEvents.OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const groupId = target.dataset.groupId
      const oldPinnedTabs = await browser.tabs.query({ pinned: true, currentWindow: true })
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
      groupRepository.removeById(groupIdToRemove).then(() => groupView.displayStoredGroups())

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
      await groupRepository.update(group).then(() => groupView.displayStoredGroups())

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
      const pinnedTabs = await browser.tabs.query({ pinned: true, currentWindow: true })
      const pinnedTabsUrls = pinnedTabs.map((tab) => tab.url)

      await groupRepository.add(new GroupModel(groupName, pinnedTabsUrls)).then(() => groupView.displayStoredGroups())
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
      groupView.displayStoredGroups()
      return
    }

    const groups = await groupRepository.findAllByPartialName(searchTerm)
    groups.forEach((group) => {
      const groupElement = groupView.createGroupItemElement(group.name, group.id)
      groupsDisplay.appendChild(groupElement)
    })
  })

})

