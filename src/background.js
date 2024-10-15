import { TabsClient } from "./clients/tabsClient.js";
import { GroupRepository } from "./repositories/groupRepository.js"
import { PreferencesRepository } from "./repositories/preferencesRepository.js"
import { GroupService } from "./services/groupService.js"
import { PreferencesService } from "./services/preferencesService.js"
import { TabsService } from "./services/tabsService.js"

chrome.windows.onCreated.addListener(async () => {
  const windows = await chrome.windows.getAll({})
  if (windows.length === 1) {
    console.info("ℹ️  New profile loaded");
    const preferencesRepository = new PreferencesRepository(chrome)
    const preferencesService = new PreferencesService(preferencesRepository)
    const groupRepository = new GroupRepository(chrome)
    const groupService = new GroupService(groupRepository)
    const tabsClient = new TabsClient(chrome)
    const tabsService = new TabsService(tabsClient)

    const preferences = await preferencesService.get()
    const newGroup = await groupService.findById(preferences.groupIdToLoadOnStartup)
    await tabsService.replacePinnedTabsOnCurrentWindow(newGroup)
  } else {
    console.info("ℹ️  Another window opened");
  }
})

