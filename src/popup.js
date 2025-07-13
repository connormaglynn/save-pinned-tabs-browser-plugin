import { GroupView } from './views/groupsView.js'
import { EditGroupView } from './views/editGroupView.js'
import { GroupRepository } from './repositories/groupRepository.js'
import { ClickEventHandler } from './handlers/clickEventHandler.js'
import { GroupService } from './services/groupService.js'
import { PreferencesRepository } from './repositories/preferencesRepository.js'
import { PreferencesService } from './services/preferencesService.js'
import { TabsClient } from './clients/tabsClient.js'
import { TabsService } from './services/tabsService.js'

document.addEventListener("DOMContentLoaded", async () => {
  const clickEvents = {
    OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT: "OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT",
    REMOVE_GROUP_BY_GROUP_ID_ON_ELEMENT: "REMOVE_GROUP_BY_GROUP_ID_ON_ELEMENT",
    SAVE_GROUP_EDITS_BY_GROUP_ID_ON_ELEMENT: "SAVE_GROUP_EDITS_BY_GROUP_ID_ON_ELEMENT",
    OPEN_EDIT_VIEW_BY_GROUP_ID_ON_ELEMENT: "OPEN_EDIT_VIEW_BY_GROUP_ID_ON_ELEMENT",
    CLOSE_EDIT_VIEW: "CLOSE_EDIT_VIEW",
    CREATE_NEW_GROUP_FROM_CURRENT_PINNED_TABS: "CREATE_NEW_GROUP_FROM_CURRENT_PINNED_TABS",
    ADD_URL_TO_GROUP: "ADD_URL_TO_GROUP",
    REMOVE_URL_FROM_GROUP_BY_INDEX: "REMOVE_URL_FROM_GROUP_BY_INDEX",
  }

  const browser = chrome
  const preferencesRepository = new PreferencesRepository(browser)
  const groupRepository = new GroupRepository(browser)
  const preferencesService = new PreferencesService(preferencesRepository)
  const groupService = new GroupService(groupRepository)
  const tabsClient = new TabsClient(browser)
  const tabsService = new TabsService(tabsClient, groupService)
  const groupsView = new GroupView(groupService, clickEvents)
  const editGroupView = new EditGroupView(groupService, clickEvents)
  const clickEventHandler = new ClickEventHandler(groupService, preferencesService, tabsService, groupsView, editGroupView, clickEvents)

  await groupService.removeUnlinkedGroups()
  await groupsView.open(await groupService.findAll())

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

    if (searchTerm) {
      await groupsView.refresh(await groupService.findAllByPartialName(searchTerm))
    } else {
      await groupsView.refresh(await groupService.findAll())
    }

    searchBoxElement.focus()
  })

})

