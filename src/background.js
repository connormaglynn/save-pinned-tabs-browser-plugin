import { GroupRepository } from "./repositories/groupRepository.js"
import { PreferencesRepository } from "./repositories/preferencesRepository.js"
import { GroupService } from "./services/groupService.js"
import { PreferencesService } from "./services/preferencesService.js"

chrome.windows.onCreated.addListener(async () => {
  console.log("Browser has started up! Test")
  const windows = await chrome.windows.getAll({})
  if (windows.length === 1) {
    console.info("ℹ️  New profile loaded");
    const preferencesRepository = new PreferencesRepository(chrome)
    const preferencesService = new PreferencesService(preferencesRepository)
    const groupRepository = new GroupRepository(chrome)
    const groupService = new GroupService(groupRepository)

    const preferences = await preferencesService.get()

    const oldPinnedTabs = await chrome.tabs.query({ pinned: true, currentWindow: true })
    const oldPinnedTabsIds = oldPinnedTabs.map((tab) => tab.id)

    const newGroup = await groupService.findById(preferences.loadOnStartup)
    const newPinnedTabsUrls = newGroup?.pinnedTabsUrls
    newPinnedTabsUrls?.forEach(async (url) => {
      await chrome.tabs.create({
        url: url,
        pinned: true,
      })
    })

    await chrome.tabs.remove(oldPinnedTabsIds)

  } else {
    console.info("ℹ️  Another window opened");
  }

});

