document.addEventListener("DOMContentLoaded", async () => {
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
  const groupsView = new GroupView(groupRepository, clickEvents)
  const editGroupView = new EditGroupView()
  const clickEventHandler = new ClickEventHandler(groupRepository, groupsView, editGroupView, browser, clickEvents)

  await groupRepository.removeUnlinkedGroups()
  await groupsView.open(await groupRepository.findAll())

  document.addEventListener("click", async (event) => {
    console.info(`🖱️ ClickEvent Triggered | clickEvent on Target [ ${event.target.dataset.clickEvent} ]`)
    clickEventHandler.handle(event)
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

