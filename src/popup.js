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
  const groupsView = new GroupView(groupRepository, clickEvents)
  const editGroupView = new EditGroupView()

  await groupRepository.removeUnlinkedGroups()
  await groupsView.open(await groupRepository.findAll())

  document.addEventListener("click", async (event) => {
    const target = event.target
    const clickEvent = target.dataset.clickEvent

    console.info(`🖱️ ClickEvent Triggered | clickEvent on Target [ ${clickEvent} ]`)

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
      await groupRepository.removeById(groupIdToRemove)
      await groupsView.refresh(await groupRepository.findAll())
      editGroupView.close()
    }

    if (clickEvents.SAVE_GROUP_EDITS_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const groupIdToEdit = target.dataset.groupId
      const edittedGroup = editGroupView.getValues()

      await groupRepository.update(new GroupEntity(groupIdToEdit, edittedGroup.name, edittedGroup.pinnedTabsUrls))
      await groupsView.refresh(await groupRepository.findAll())
      editGroupView.close()
    }

    if (clickEvents.CREATE_NEW_GROUP_FROM_CURRENT_PINNED_TABS === clickEvent) {
      const groupName = document.getElementById("groupName").value
      const pinnedTabs = await browser.tabs.query({ pinned: true, currentWindow: true })
      const pinnedTabsUrls = pinnedTabs.map((tab) => tab.url)

      await groupRepository.add(new GroupModel(groupName, pinnedTabsUrls))
      await groupsView.refresh(await groupRepository.findAll())
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
    const searchBoxElement = document.getElementById("searchBox")
    const searchTerm = searchBoxElement.value

    const groupsDisplay = document.getElementById("groupsDisplay")
    while (groupsDisplay.firstChild) {
      groupsDisplay.removeChild(groupsDisplay.lastChild)
    }

    if (searchTerm) {
      await groupsView.refresh(await groupRepository.findAllByPartialName(searchTerm))
    } else {
      await groupsView.refresh(await groupRepository.findAll())
    }

    searchBoxElement.focus()
  })

})

