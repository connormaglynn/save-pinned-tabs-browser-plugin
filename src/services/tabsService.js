import { TabsClient } from "../clients/tabsClient.js"
import { GroupEntity } from "../repositories/groupRepository.js"
import { GroupService } from "./groupService.js"

export class TabsService {
  /** @param {TabsClient} tabsClient @param {GroupService} groupService **/
  constructor(tabsClient, groupService) {
    this.tabsClient = tabsClient
    this.groupService = groupService
  }

  /** @async @param {GroupEntity} group **/
  async replacePinnedTabsOnCurrentWindow(group) {
    const oldPinnedTabs = await this.tabsClient.getPinnedTabsOnCurrentWindow()
    const oldPinnedTabsIds = oldPinnedTabs.map((tab) => tab.id)

    const newPinnedTabsUrls = []
    for (const url of group?.pinnedTabsUrls) {
      if (url.startsWith("#groupId=")) {
        const groupId = url.split("#groupId=")[1]
        const groupComponent = await this.groupService.findById(groupId)
        if (groupComponent) {
          newPinnedTabsUrls.push(...groupComponent?.pinnedTabsUrls)
        } else {
          console.warn(`⚠️  Group with ID [ ${groupId} ] not found for pinned tabs replacement.`)
        }
      } else {
        newPinnedTabsUrls.push(url)
      }
    }

    await this.tabsClient.createPinnedTabs(newPinnedTabsUrls)
    await this.tabsClient.removePinnedTabsByIds(oldPinnedTabsIds)
  }

  /** @async @param url @returns Promise<Array<string>>> **/
  async getPinnedTabsOnCurrentWindow() {
    return await this.tabsClient.getPinnedTabsOnCurrentWindow()
  }
}
