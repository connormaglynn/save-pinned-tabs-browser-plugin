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
  const editGroupView = new EditGroupView()

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
      editGroupView.close()
    }

    if (clickEvents.SAVE_GROUP_EDITS_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const groupIdToEdit = target.dataset.groupId
      const edittedGroup = editGroupView.getValues()
      const updatedGroupEntity = new GroupEntity(groupIdToEdit, edittedGroup.name, edittedGroup.pinnedTabsUrls)
      await groupRepository.update(updatedGroupEntity).then(() => groupView.displayStoredGroups())
      editGroupView.close()
    }

    if (clickEvents.CREATE_NEW_GROUP_FROM_CURRENT_PINNED_TABS === clickEvent) {
      const groupName = document.getElementById("groupName").value
      const pinnedTabs = await browser.tabs.query({ pinned: true, currentWindow: true })
      const pinnedTabsUrls = pinnedTabs.map((tab) => tab.url)

      await groupRepository.add(new GroupModel(groupName, pinnedTabsUrls)).then(() => groupView.displayStoredGroups())
    }

    if (clickEvents.OPEN_EDIT_VIEW_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const group = await groupRepository.findById(target.dataset.groupId)
      editGroupView.open(group)
    }

    if (clickEvents.CLOSE_EDIT_VIEW === clickEvent) {
      editGroupView.close()
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

